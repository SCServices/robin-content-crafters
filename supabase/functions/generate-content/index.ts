import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { contentType, companyInfo, serviceId, locationId } = await req.json();
    console.log('Received request:', { contentType, companyInfo, serviceId, locationId });

    if (!contentType || !companyInfo || !serviceId || !companyInfo.companyId) {
      throw new Error('Missing required parameters');
    }

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    let prompt = '';
    const systemPrompt = `You are an expert content writer and SEO specialist with deep experience in creating engaging, conversion-focused content for local businesses. Your writing style is professional yet approachable, using clear language that resonates with both consumers and business clients. Focus on creating content that:
    - Demonstrates deep understanding of the industry and local market
    - Builds trust through expertise and credibility
    - Includes natural, contextual calls-to-action
    - Optimizes for local SEO without compromising readability
    - Uses a warm, professional tone that connects with readers`;
    
    switch (contentType) {
      case 'service':
        prompt = `
          Create a comprehensive service page for ${companyInfo.companyName}, a respected ${companyInfo.industry} company, focusing on their ${companyInfo.serviceName} service.

          Structure the content to:
          1. Open with a compelling introduction that immediately addresses the reader's needs and pain points
          2. Highlight the unique benefits and features of ${companyInfo.serviceName}, explaining why they matter to the customer
          3. Include specific details about:
             - The service process and what customers can expect
             - Quality standards and professional certifications
             - Typical problems solved and outcomes achieved
             - Relevant experience and expertise in this service area
          4. Address common customer questions and concerns
          5. End with a clear, compelling call to action

          Key requirements:
          - Use a professional yet conversational tone
          - Include specific details about ${companyInfo.serviceName} that set it apart
          - Focus on value and benefits rather than just features
          - Incorporate natural SEO keywords without keyword stuffing
          - Keep paragraphs short and scannable
          - Use subheadings to break up content
          - End with a natural call to action that encourages contact

          Write the content in Markdown format.`;
        break;

      case 'location':
        prompt = `
          Create a location-specific service page for ${companyInfo.companyName}'s ${companyInfo.serviceName} service in ${companyInfo.location}.

          Structure the content to:
          1. Open with a locally-focused introduction that connects with the ${companyInfo.location} community
          2. Explain how ${companyInfo.serviceName} is specifically tailored to:
             - Local needs and preferences in ${companyInfo.location}
             - Regional challenges or requirements
             - Area-specific regulations or standards
          3. Include details about:
             - Local service coverage and response times
             - Experience serving the ${companyInfo.location} area
             - Understanding of local market conditions
          4. Highlight any community involvement or local partnerships
          5. End with a location-specific call to action

          Key requirements:
          - Incorporate local landmarks or area-specific references naturally
          - Address specific needs of ${companyInfo.location} customers
          - Include local SEO elements without forcing them
          - Maintain a neighborly yet professional tone
          - Use clear subheadings and scannable format
          - Keep content focused on local relevance
          
          Write the content in Markdown format.`;
        break;

      case 'blog':
        const blogTitles = [
          `10 Essential Tips for ${companyInfo.serviceName} in ${companyInfo.location}`,
          `7 Reasons to Choose Professional ${companyInfo.serviceName} Services in ${companyInfo.location}`,
          `5 Common ${companyInfo.serviceName} Mistakes and How to Avoid Them`,
          `How to Get the Best ${companyInfo.serviceName} Results in ${companyInfo.location}`,
          `A Step-by-Step Guide to ${companyInfo.serviceName} for ${companyInfo.location} Residents`,
          `Expert Advice on ${companyInfo.serviceName} for ${companyInfo.location} Homeowners`,
          `The Ultimate Guide to ${companyInfo.serviceName} in ${companyInfo.location}`,
          `Understanding the Costs of ${companyInfo.serviceName} in ${companyInfo.location}`
        ];

        prompt = `
          Create an informative blog post about ${companyInfo.serviceName} for ${companyInfo.companyName}'s audience in ${companyInfo.location}.

          Use one of these titles:
          ${blogTitles.join('\n')}

          Structure the content to:
          1. Start with an engaging hook that relates to ${companyInfo.location} readers
          2. Include practical information about:
             - Common challenges or questions about ${companyInfo.serviceName}
             - Professional insights and expert tips
             - Industry best practices
             - Cost-saving or efficiency-improving strategies
          3. Provide actionable advice readers can use
          4. Include relevant examples or case studies
          5. End with a subtle call to action

          Key requirements:
          - Use a helpful, conversational tone
          - Include practical tips and actionable advice
          - Reference local context when relevant
          - Break up text with subheadings and bullet points
          - Focus on providing genuine value
          - Keep the promotional aspect subtle
          - Include relevant statistics or data points when possible

          Write the content in Markdown format.`;
        break;
      
      default:
        throw new Error('Invalid content type specified');
    }

    console.log('Calling OpenAI with prompt:', prompt);
    
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!openAIResponse.ok) {
      const error = await openAIResponse.json();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const completion = await openAIResponse.json();
    if (!completion.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from OpenAI API');
    }

    const generatedContent = completion.choices[0].message.content;
    console.log('Generated content:', generatedContent.substring(0, 100) + '...');

    const { error: updateError } = await supabase
      .from('generated_content')
      .update({ 
        content: generatedContent,
        status: 'generated'
      })
      .eq('service_id', serviceId)
      .eq('company_id', companyInfo.companyId)
      .is('location_id', locationId || null);

    if (updateError) {
      console.error('Database update error:', updateError);
      throw updateError;
    }

    console.log('Content successfully updated in database');

    return new Response(
      JSON.stringify({ 
        success: true,
        content: generatedContent 
      }),
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
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred',
        details: error.toString()
      }),
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