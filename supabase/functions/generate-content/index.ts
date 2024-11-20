import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    const { contentId, type, companyName, industry, service, location } = await req.json();

    console.log(`Generating content for ${type} with ID ${contentId}`);

    // Update status to 'generating'
    await supabase
      .from('generated_content')
      .update({ status: 'generating' })
      .eq('id', contentId);

    // Generate content based on type
    const prompt = getPromptForType(type, { companyName, industry, service, location });
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are a professional content writer specializing in creating engaging, SEO-optimized content for business websites. Your content is clear, informative, and optimized for search engines while maintaining readability and appeal to human readers.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error('OpenAI API request failed');
    }

    const result = await response.json();
    const generatedContent = result.choices[0].message.content;

    // Generate meta description
    const metaResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are an SEO expert. Create concise, compelling meta descriptions that accurately summarize content while encouraging clicks. Keep descriptions between 150-160 characters.'
          },
          { 
            role: 'user', 
            content: `Create a meta description for this content:\n\n${generatedContent}`
          }
        ],
        temperature: 0.7,
      }),
    });

    const metaResult = await metaResponse.json();
    const metaDescription = metaResult.choices[0].message.content;

    // Update content in database
    const { error: updateError } = await supabase
      .from('generated_content')
      .update({ 
        content: generatedContent,
        meta_description: metaDescription,
        status: 'completed'
      })
      .eq('id', contentId);

    if (updateError) throw updateError;

    console.log(`Successfully generated content for ${type} with ID ${contentId}`);

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-content function:', error);

    // Update status to error if we have contentId
    if (req.contentId) {
      const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
      await supabase
        .from('generated_content')
        .update({ status: 'error' })
        .eq('id', req.contentId);
    }

    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function getPromptForType(type: string, data: {
  companyName: string;
  industry: string;
  service: string;
  location?: string;
}) {
  switch (type) {
    case 'service':
      return `Create comprehensive, SEO-optimized content for a service page about ${data.service} services offered by ${data.companyName}, a ${data.industry} company. Include:
        1. A compelling introduction
        2. Key benefits and features of the service
        3. Why choose ${data.companyName} for this service
        4. Call to action
        Format the content using Markdown.`;
    
    case 'location':
      return `Create location-specific, SEO-optimized content about ${data.service} services offered by ${data.companyName} in ${data.location}. Include:
        1. Local context and relevance
        2. Service details specific to ${data.location}
        3. Why choose ${data.companyName} in ${data.location}
        4. Local call to action
        Format the content using Markdown.`;
    
    case 'blog':
      return `Write an informative, SEO-optimized blog post about ${data.service} in ${data.location}. The post should:
        1. Address common questions and concerns
        2. Provide valuable insights and tips
        3. Establish ${data.companyName}'s expertise in ${data.industry}
        4. Include relevant examples and best practices
        Format the content using Markdown.`;
    
    default:
      return `Create SEO-optimized content for ${data.companyName}'s ${data.service} services.`;
  }
}