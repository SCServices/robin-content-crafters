import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { contentType, companyInfo, serviceId, locationId, model = "gpt-4o mini", prompt } = await req.json();
    
    console.log('Received request:', { contentType, companyInfo, serviceId, locationId, prompt });

    if (!contentType || !companyInfo || !serviceId || !companyInfo.companyId) {
      throw new Error('Missing required parameters');
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(companyInfo.companyId) || !uuidRegex.test(serviceId) || (locationId && !uuidRegex.test(locationId))) {
      throw new Error('Invalid UUID format');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    
    // Use the provided prompt if available, otherwise use default
    let finalPrompt = prompt;
    const systemPrompt = `You are a Local SEO expert and experienced content writer specializing in creating high-quality, SEO-optimized content for business websites in blue-collar industries, homeowners' advice, and DIY topics. You focus on writing engaging, easy-to-read articles that are accessible to a wide audience. Use simple language, avoid technical jargon, and write in a conversational and friendly tone.`;
    
    // If no prompt is provided, use default prompts
    if (!finalPrompt) {
      switch (contentType) {
        case 'service':
          finalPrompt = `Write a service page for ${companyInfo.companyName}, a ${companyInfo.industry} company, focusing on their ${companyInfo.serviceName} service. Create content that feels like a helpful guide, blending essential information with persuasive elements, while maintaining an approachable tone. The page should have 3-5 naturally created H2 or H3 headlines that blend into the content structure and narrative and are SEO relevant according to EEAT.`;
          break;

        case 'location':
          finalPrompt = `Write a location-based service page for ${companyInfo.companyName}'s ${companyInfo.serviceName} service in ${companyInfo.location}. Craft the content with a focus on how this service specifically benefits people in this location, making the content feel authentic and locally relevant. The page should have 3-5 naturally created H2 or H3 headlines that blend into the content structure and narrative and are SEO relevant according to EEAT.`;
          break;

        case 'blog':
          finalPrompt = `Write an engaging blog post for ${companyInfo.companyName}, a ${companyInfo.industry} company, about ${companyInfo.serviceName} services in ${companyInfo.location}. The blog should be informative but also relatable, using real-world examples, tips, and solutions that readers can easily apply. The page should have 3-5 naturally created H2 or H3 headlines that blend into the content structure and narrative and are SEO relevant according to EEAT.`;
          break;
        
        default:
          throw new Error('Invalid content type specified');
      }
    }

    console.log('Using prompt:', finalPrompt);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: finalPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const completion = await response.json();
    if (!completion.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from OpenAI API');
    }

    const generatedContent = completion.choices[0].message.content;

    return new Response(
      JSON.stringify({ success: true, content: generatedContent }),
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