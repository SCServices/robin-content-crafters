import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { contentType, companyInfo, location } = await req.json();
    
    console.log('Generating title for:', { contentType, companyInfo, location });

    let prompt = `Generate a compelling, SEO-optimized title for a ${contentType} page. 
    The title should be natural, engaging, and related to the company's industry but not include its name.`;

    if (location) {
      prompt += ` The content is specific to ${location}.`;
    }

    prompt += `\n\nGuidelines:
    - Keep it under 60 characters for SEO
    - Include the main service and location (if applicable)
    - Make it action-oriented and benefit-focused
    - Avoid generic templates
    - Don't use special characters`;

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
            content: 'You are an expert SEO copywriter specializing in creating engaging, natural-sounding titles for service businesses. Your titles are compelling, clear, and optimized for search engines while maintaining readability.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate title');
    }

    const data = await response.json();
    const title = data.choices[0].message.content.trim();

    return new Response(
      JSON.stringify({ title }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-titles function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
