import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const generatePrompt = (contentType: string, companyInfo: any) => {
  const baseContext = `You are writing content for ${companyInfo.companyName}, a company in the ${companyInfo.industry} industry that provides ${companyInfo.serviceName} services.`;
  
  switch (contentType) {
    case 'service':
      return `${baseContext}
Write a comprehensive service page that:
1. Explains the ${companyInfo.serviceName} service in detail
2. Highlights the company's expertise and experience
3. Describes the benefits and value proposition
4. Includes a clear call to action
Format the content with proper HTML headings (h2, h3) and paragraphs.`;

    case 'location':
      return `${baseContext}
Write a location-specific service page for ${companyInfo.location} that:
1. Describes ${companyInfo.serviceName} services available in ${companyInfo.location}
2. Mentions local service coverage and availability
3. Includes location-specific benefits and considerations
4. Adds relevant local context and pain points
Format the content with proper HTML headings (h2, h3) and paragraphs.`;

    case 'blog':
      return `${baseContext}
Write an informative blog post about ${companyInfo.serviceName} in ${companyInfo.location} that:
1. Provides valuable insights and tips
2. Addresses common questions and concerns
3. Includes industry best practices
4. Offers expert advice and recommendations
Format the content with proper HTML headings (h2, h3) and paragraphs.`;

    default:
      throw new Error('Invalid content type');
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { contentType, companyInfo, serviceId, locationId, titleOnly } = await req.json();
    
    console.log('Received request:', { contentType, companyInfo, serviceId, locationId, titleOnly });

    if (!contentType || !companyInfo || !companyInfo.companyName || !companyInfo.industry) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const prompt = generatePrompt(contentType, companyInfo);
    console.log('Generated prompt:', prompt);

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
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
            content: 'You are an expert content writer specializing in creating engaging, SEO-optimized content for business websites.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error('OpenAI API error');
    }

    const completion = await response.json();
    const generatedContent = completion.choices[0].message.content;

    // Update the content in the database if not just generating title
    if (!titleOnly) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      const supabase = createClient(supabaseUrl!, supabaseKey!);

      const { error: updateError } = await supabase
        .from('generated_content')
        .update({ 
          content: generatedContent,
          status: 'generated',
          updated_at: new Date().toISOString()
        })
        .eq('service_id', serviceId)
        .eq('type', contentType);

      if (locationId) {
        await supabase
          .from('generated_content')
          .update({ 
            content: generatedContent,
            status: 'generated',
            updated_at: new Date().toISOString()
          })
          .eq('service_id', serviceId)
          .eq('location_id', locationId)
          .eq('type', contentType);
      }

      if (updateError) {
        console.error('Error updating content:', updateError);
        throw updateError;
      }
    }

    return new Response(
      JSON.stringify({ content: generatedContent }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Error in generate-content function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});