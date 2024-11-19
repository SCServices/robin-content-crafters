import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { contentType, companyInfo, serviceId, locationId } = await req.json();
    console.log('Generating content for:', { contentType, companyInfo, serviceId, locationId });

    // Construct prompt based on content type
    let prompt = '';
    switch (contentType) {
      case 'service':
        prompt = `Write a compelling service page for ${companyInfo.serviceName} offered by ${companyInfo.companyName}, 
          a ${companyInfo.industry} company. Focus on benefits, features, and why customers should choose this service. 
          Include a clear call to action.`;
        break;
      case 'location':
        prompt = `Write a location-specific service page for ${companyInfo.serviceName} in ${companyInfo.location} 
          offered by ${companyInfo.companyName}. Include local context, service area coverage, and why local customers 
          should choose this service. Optimize for local SEO.`;
        break;
      case 'blog':
        prompt = `Write an informative blog post about ${companyInfo.serviceName} in ${companyInfo.location}. 
          Include practical tips, common problems and solutions, and industry insights. The content should position 
          ${companyInfo.companyName} as an expert in ${companyInfo.industry}.`;
        break;
      default:
        throw new Error('Invalid content type');
    }

    // Generate content using OpenAI
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: 'You are an expert SEO content writer specializing in local business content. Write in a professional, engaging style that builds trust and encourages action.'
          },
          { role: 'user', content: prompt }
        ],
      }),
    });

    const data = await openAIResponse.json();
    const generatedContent = data.choices[0].message.content;

    // Update the content in the database
    const { error: updateError } = await supabase
      .from('generated_content')
      .update({ 
        content: generatedContent,
        status: 'generated',
        updated_at: new Date().toISOString()
      })
      .eq('service_id', serviceId)
      .eq('location_id', locationId)
      .eq('type', contentType);

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({ success: true, content: generatedContent }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-content function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});