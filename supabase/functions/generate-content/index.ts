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
    let systemPrompt = 'You are an expert content writer specializing in creating high-quality, SEO-optimized content for business websites.';
    
    // Construct prompt based on content type
    switch (contentType) {
      case 'service':
        prompt = `Write a comprehensive service page for ${companyInfo.companyName}, a ${companyInfo.industry} company.
                 Focus on their ${companyInfo.serviceName} service.
                 
                 Structure the content with these sections:
                 1. Introduction (compelling overview of the service)
                 2. Key Benefits and Features
                 3. Why Choose ${companyInfo.companyName}
                 4. Our ${companyInfo.serviceName} Process
                 5. Common Problems We Solve
                 6. Call to Action
                 
                 Requirements:
                 - Use H2 and H3 headings for sections
                 - Keep the tone professional yet engaging
                 - Include relevant keywords naturally
                 - Focus on value proposition
                 - Make it SEO-friendly
                 - Around 800-1000 words`;
        break;
      
      case 'location':
        prompt = `Write a location-specific service page for ${companyInfo.companyName}'s ${companyInfo.serviceName} service in ${companyInfo.location}.
                 
                 Structure the content with these sections:
                 1. Introduction (with local context)
                 2. Our ${companyInfo.serviceName} Services in ${companyInfo.location}
                 3. Why Choose Us in ${companyInfo.location}
                 4. Local Service Coverage
                 5. ${companyInfo.location}-Specific Benefits
                 6. Contact Information and Call to Action
                 
                 Requirements:
                 - Use H2 and H3 headings for sections
                 - Include local landmarks and context
                 - Optimize for local SEO
                 - Maintain professional tone
                 - Around 600-800 words
                 - Include location-specific keywords`;
        break;
      
      case 'blog':
        prompt = `Write an informative blog post about ${companyInfo.serviceName} services in ${companyInfo.location}.
                 This is for ${companyInfo.companyName}, a ${companyInfo.industry} company.
                 
                 Structure the content with these sections:
                 1. Introduction
                 2. Understanding ${companyInfo.serviceName} in ${companyInfo.location}
                 3. Key Considerations
                 4. Expert Tips and Best Practices
                 5. Local Factors to Consider
                 6. Conclusion with Call to Action
                 
                 Requirements:
                 - Use H2 and H3 headings for sections
                 - Include actionable advice
                 - Write in an engaging, informative style
                 - Include relevant statistics or examples
                 - Around 800-1000 words
                 - Optimize for both local and service-related keywords`;
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
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate content');
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    // Update the content in the database
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl!, supabaseKey!);

    // Construct the query based on content type
    const query = {
      company_id: companyInfo.companyId,
      service_id: serviceId,
      ...(locationId && { location_id: locationId }),
      type: contentType,
    };

    const { error: updateError } = await supabase
      .from('generated_content')
      .update({ 
        content: generatedContent,
        status: 'generated'
      })
      .match(query);

    if (updateError) {
      console.error('Error updating content:', updateError);
      throw updateError;
    }

    // Return the generated content
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