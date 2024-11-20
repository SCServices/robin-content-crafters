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
    const { contentType, companyInfo, serviceId, locationId, titleOnly } = await req.json();
    
    console.log('Received request:', { contentType, companyInfo, serviceId, locationId, titleOnly });

    if (!contentType || !companyInfo || !companyInfo.companyId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    let prompt = '';
    const systemPrompt = titleOnly 
      ? `You are a professional SEO copywriter specializing in creating engaging, SEO-optimized titles and headlines.`
      : `You are a professional content writer and Local SEO expert specializing in creating high-quality, SEO-optimized content.`;

    if (titleOnly) {
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
        default:
          return new Response(
            JSON.stringify({ error: 'Invalid content type' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
      }

      try {
        const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 60,
          }),
        });

        if (!openAIResponse.ok) {
          throw new Error('OpenAI API error');
        }

        const completion = await openAIResponse.json();
        const generatedTitle = completion.choices[0].message.content.trim();

        return new Response(
          JSON.stringify({ title: generatedTitle }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error('Error generating title:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to generate title' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Full content generation logic
    const contentPrompt = `Generate comprehensive content for ${companyInfo.companyName}'s ${companyInfo.serviceName} service.`;
    
    try {
      const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: contentPrompt }
          ],
          temperature: 0.7,
        }),
      });

      if (!openAIResponse.ok) {
        throw new Error('OpenAI API error');
      }

      const completion = await openAIResponse.json();
      const generatedContent = completion.choices[0].message.content;

      // Update content in database
      const { error: updateError } = await supabase
        .from('generated_content')
        .update({ 
          content: generatedContent,
          status: 'generated'
        })
        .match({ 
          company_id: companyInfo.companyId,
          service_id: serviceId,
          ...(locationId ? { location_id: locationId } : {}),
          type: contentType
        });

      if (updateError) {
        throw updateError;
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (error) {
      console.error('Error generating content:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to generate content' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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