import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase_supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { contentType, companyInfo, serviceId, locationId, titleOnly } = await req.json();
    
    console.log('Received request:', { contentType, companyInfo, serviceId, locationId, titleOnly });

    // Validate required parameters
    if (!contentType || !companyInfo || !companyInfo.companyName || !companyInfo.industry) {
      console.error('Missing required parameters:', { contentType, companyInfo });
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { 
          status: 400, 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          } 
        }
      );
    }

    // For service pages, we need serviceId
    if (contentType === 'service' && !serviceId) {
      console.error('Missing serviceId for service page');
      return new Response(
        JSON.stringify({ error: 'Missing serviceId for service page' }),
        { 
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // For location pages and blog posts, we need both serviceId and locationId
    if ((contentType === 'location' || contentType === 'blog') && (!serviceId || !locationId)) {
      console.error('Missing serviceId or locationId for location/blog page');
      return new Response(
        JSON.stringify({ error: 'Missing serviceId or locationId for location/blog page' }),
        { 
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // If only generating title
    if (titleOnly) {
      const title = await generateTitle(contentType, companyInfo);
      return new Response(
        JSON.stringify({ title }),
        { 
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // Generate full content
    const content = await generateContent(contentType, companyInfo);
    
    return new Response(
      JSON.stringify({ content }),
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

async function generateTitle(contentType: string, companyInfo: any) {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  
  let prompt = '';
  switch (contentType) {
    case 'service':
      prompt = `Create a compelling, SEO-optimized title for a service page about ${companyInfo.serviceName} services offered by ${companyInfo.companyName}.`;
      break;
    case 'location':
      prompt = `Create a location-specific, SEO-optimized title for ${companyInfo.serviceName} services offered by ${companyInfo.companyName} in ${companyInfo.location}.`;
      break;
    case 'blog':
      prompt = `Create an engaging, SEO-optimized blog post title about ${companyInfo.serviceName} services in ${companyInfo.location}.`;
      break;
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        { 
          role: 'system', 
          content: 'You are a professional SEO copywriter specializing in creating engaging, SEO-optimized titles and headlines.' 
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 60,
    }),
  });

  if (!response.ok) {
    throw new Error('OpenAI API error');
  }

  const completion = await response.json();
  return completion.choices[0].message.content.trim();
}

async function generateContent(contentType: string, companyInfo: any) {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  
  const prompt = `Generate comprehensive content for ${companyInfo.companyName}'s ${companyInfo.serviceName} service. Include relevant information about their industry (${companyInfo.industry}).`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        { 
          role: 'system', 
          content: 'You are a professional content writer and Local SEO expert specializing in creating high-quality, SEO-optimized content.' 
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
  return completion.choices[0].message.content;
}