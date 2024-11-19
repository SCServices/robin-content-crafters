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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { contentType, companyInfo, serviceId, locationId } = await req.json();
    
    console.log('Received request:', { contentType, companyInfo, serviceId, locationId });

    // Validate required parameters
    if (!contentType || !companyInfo || !serviceId || !companyInfo.companyId) {
      throw new Error('Missing required parameters');
    }

    // Validate UUIDs
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(companyInfo.companyId) || !uuidRegex.test(serviceId) || (locationId && !uuidRegex.test(locationId))) {
      throw new Error('Invalid UUID format');
    }

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    let prompt = '';
    const systemPrompt = `You are a Local SEO expert and experienced content writer specializing in creating high-quality, SEO-optimized content for business websites in blue-collar industries, homeowners' advice, and DIY topics. You focus on writing engaging, easy-to-read articles that are accessible to a wide audience. Use simple language, avoid technical jargon, and write in a conversational and friendly tone.`;

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
                 - Keep the tone professional but approachable, ensuring clarity and simplicity
                 - Write in a conversational and friendly tone, using simple language
                 - Avoid technical jargon and complex terms; use common everyday words
                 - Use active voice and positive language
                 - Include relevant keywords naturally (avoid keyword stuffing)
                 - Focus on value proposition and address customer needs and pain points
                 - Make it SEO-friendly, aiming for a keyword density of 1-2%
                 - Around 800-1000 words
                 - Before finalizing, review the content to ensure it meets all the above guidelines and is free of errors.`;
        break;
      
      case 'location':
        prompt = `Write a location-specific service page for ${companyInfo.companyName}'s ${companyInfo.serviceName} service in ${companyInfo.location}.
                 
                 Structure the content with these sections:
                 1. Introduction (with local context)
                 2. Our ${companyInfo.serviceName} Services in ${companyInfo.location}
                 3. Why Choose ${companyInfo.companyName} in ${companyInfo.location}
                 4. Local Service Coverage
                 5. ${companyInfo.location}-Specific Benefits
                 6. Contact Information and Call to Action
                 
                 Requirements:
                 - Use H2 and H3 headings for sections
                 - Include local landmarks, events, or community initiatives to strengthen local connections
                 - Write in a conversational and friendly tone, using simple language
                 - Avoid technical jargon and complex terms; use common everyday words
                 - Use active voice and positive language
                 - Optimize for local SEO, including location-specific keywords naturally (avoid keyword stuffing)
                 - Address the needs and pain points of local customers
                 - Emphasize the local expertise of the service provider
                 - Around 600-800 words
                 - Before finalizing, review the content to ensure it meets all the above guidelines and is free of errors.`;
        break;
      
      case 'blog':
        prompt = `Write an informative blog post for ${companyInfo.companyName}, a ${companyInfo.industry} company, about ${companyInfo.serviceName} services in ${companyInfo.location}.
                 
                 Choose one of the following blog post types that best suits the topic and audience:

                 1. Listicles
                 2. How-To Guides
                 3. Comparison Posts
                 4. Case Studies
                 5. Checklists
                 6. Beginner's Guides
                 7. Problem-Solution Posts
                 8. Ultimate Guides
                 9. Personal Stories
                 10. Trend Analysis Posts
                 11. Reviews

                 Structure the content appropriately based on the chosen blog post type.

                 Requirements:
                 - Use H2 and H3 headings for sections
                 - Write in a conversational and friendly tone, using simple language
                 - Avoid technical jargon and complex terms; use common everyday words
                 - Use active voice and positive language
                 - Include actionable advice and practical tips
                 - Include relevant examples or statistics
                 - Include local context, referencing local landmarks or community aspects where appropriate
                 - Address the needs and pain points of local customers
                 - Emphasize the local expertise of the service provider
                 - Optimize for both local and service-related keywords naturally (avoid keyword stuffing)
                 - Aim for a length of 800-1000 words
                 - Before finalizing, review the content to ensure it meets all the above guidelines and is free of errors.`;
        break;
      
      default:
        throw new Error('Invalid content type specified');
    }

    console.log('Calling OpenAI with prompt:', prompt);
    
    // Call OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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

    if (!openAIResponse.ok) {
      const error = await openAIResponse.json();
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate content');
    }

    const completion = await openAIResponse.json();
    const generatedContent = completion.choices[0].message.content;

    // Update the content in the database
    console.log('Updating content in database for:', { serviceId, locationId });
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
      console.error('Database update error:', updateError);
      throw updateError;
    }

    return new Response(
      JSON.stringify({ success: true }),
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
