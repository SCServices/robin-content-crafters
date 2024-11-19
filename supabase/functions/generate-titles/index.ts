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
    const { services, locations, companyInfo } = await req.json();
    console.log('Generating titles for:', { services, locations, companyInfo });

    const contentEntries = [];

    // Generate service page titles
    for (const service of services) {
      const prompt = `Generate a compelling, SEO-optimized title for a service page.
      Company: ${companyInfo.companyName}
      Industry: ${companyInfo.industry}
      Service: ${service.name}
      
      Guidelines:
      - Keep it under 60 characters for SEO
      - Include the main service
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
              content: 'You are an expert SEO copywriter specializing in creating engaging, natural-sounding titles for service businesses.' 
            },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate service title');
      const data = await response.json();
      const title = data.choices[0].message.content.trim();

      contentEntries.push({
        company_id: companyInfo.companyId,
        service_id: service.id,
        title,
        type: "service"
      });
    }

    // Generate location and blog titles
    for (const service of services) {
      for (const location of locations) {
        // Location page title
        const locationPrompt = `Generate a compelling, SEO-optimized title for a location-specific service page.
        Company: ${companyInfo.companyName}
        Industry: ${companyInfo.industry}
        Service: ${service.name}
        Location: ${location.location}
        
        Guidelines:
        - Keep it under 60 characters for SEO
        - Include both service and location
        - Make it action-oriented and benefit-focused
        - Avoid generic templates
        - Don't use special characters`;

        const locationResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
                content: 'You are an expert SEO copywriter specializing in creating engaging, natural-sounding titles for service businesses.' 
              },
              { role: 'user', content: locationPrompt }
            ],
            temperature: 0.7,
          }),
        });

        if (!locationResponse.ok) throw new Error('Failed to generate location title');
        const locationData = await locationResponse.json();
        const locationTitle = locationData.choices[0].message.content.trim();

        contentEntries.push({
          company_id: companyInfo.companyId,
          service_id: service.id,
          location_id: location.id,
          title: locationTitle,
          type: "location"
        });

        // Blog post title
        const blogPrompt = `Generate a compelling, SEO-optimized title for a blog post about a local service.
        Company: ${companyInfo.companyName}
        Industry: ${companyInfo.industry}
        Service: ${service.name}
        Location: ${location.location}
        
        Guidelines:
        - Keep it under 60 characters for SEO
        - Make it engaging and click-worthy
        - Include location naturally
        - Focus on value or solving problems
        - Don't use special characters`;

        const blogResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
                content: 'You are an expert content writer specializing in creating engaging blog titles for local businesses.' 
              },
              { role: 'user', content: blogPrompt }
            ],
            temperature: 0.7,
          }),
        });

        if (!blogResponse.ok) throw new Error('Failed to generate blog title');
        const blogData = await blogResponse.json();
        const blogTitle = blogData.choices[0].message.content.trim();

        contentEntries.push({
          company_id: companyInfo.companyId,
          service_id: service.id,
          location_id: location.id,
          title: blogTitle,
          type: "blog"
        });
      }
    }

    return new Response(
      JSON.stringify({ contentEntries }),
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