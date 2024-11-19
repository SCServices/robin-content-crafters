import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { contentType, companyInfo, serviceId, locationId } = await req.json();
    console.log('Generating content for:', { contentType, companyInfo, serviceId, locationId });

    let prompt = '';
    
    // Construct prompt based on content type
    switch (contentType) {
      case 'service':
        prompt = `Write a comprehensive service page for ${companyInfo.companyName}, a ${companyInfo.industry} company.
                 Focus on their ${companyInfo.serviceName} service.
                 Include:
                 - A compelling introduction
                 - Key benefits and features of the service
                 - Why choose ${companyInfo.companyName} for ${companyInfo.serviceName}
                 - Common problems this service solves
                 - Call to action
                 Write in a professional, engaging tone. Use SEO-friendly headings.`;
        break;
      
      case 'location':
        prompt = `Write a location-specific service page for ${companyInfo.companyName}'s ${companyInfo.serviceName} service in ${companyInfo.location}.
                 Include:
                 - Local context and relevance
                 - Why choose ${companyInfo.companyName} in ${companyInfo.location}
                 - Local service coverage
                 - Location-specific benefits
                 - Contact information and call to action
                 Optimize for local SEO and maintain a professional tone.`;
        break;
      
      case 'blog':
        prompt = `Write an informative blog post about ${companyInfo.serviceName} services in ${companyInfo.location}.
                 This is for ${companyInfo.companyName}, a ${companyInfo.industry} company.
                 Include:
                 - Expert insights and tips
                 - Common challenges and solutions
                 - Industry best practices
                 - Local considerations for ${companyInfo.location}
                 - Actionable advice for readers
                 Write in an engaging, informative style with proper headings and structure.`;
        break;
      
      default:
        throw new Error('Invalid content type specified');
    }

    // Call OpenAI API
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
            content: 'You are an expert content writer specializing in creating high-quality, SEO-optimized content for business websites.' 
          },
          { role: 'user', content: prompt }
        ],
      }),
    });

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    // Return the generated content
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