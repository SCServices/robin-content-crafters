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
    const { contentType, companyInfo, serviceId, locationId, model = "gpt-4o-mini" } = await req.json();
    
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
        prompt = `
          Write a service page for ${companyInfo.companyName}, a ${companyInfo.industry} company, focusing on their ${companyInfo.serviceName} service.
          Create content that feels like a helpful guide, blending essential information with persuasive elements, while maintaining an approachable tone.
          
          Focus on the following:
          - Introduce the service in a way that highlights what makes it stand out from competitors. Make sure the introduction is engaging and speaks to customer needs. Do not call the section "introduction".
          - Provide a brief overview of the key benefits of the service, but don't just list them—explain why they matter and how they improve the customer's life or business.
          - Share real-world applications or examples of the service in action. Help the reader imagine how it will solve their specific problems.
          - Include customer testimonials or success stories if available, or use a conversational tone to build trust by showcasing the company's strengths (years of experience, certifications, etc.).
          - Keep the CTA simple and natural. Rather than a hard sell, encourage the reader to take the next step when they're ready (e.g., "Contact us to get started today"). Do not call it "conclusion" or "CTA" or mention "call to action".
          
          Avoid a cookie-cutter structure, and instead focus on making the content engaging and customer-focused with a personal touch.`;
        break;

      case 'location':
        prompt = `
          Write a location-based service page for ${companyInfo.companyName}'s ${companyInfo.serviceName} service in ${companyInfo.location}.
          Craft the content with a focus on how this service specifically benefits people in this location, making the content feel authentic and locally relevant.
          
          Points to cover:
          - Begin with a warm, friendly introduction that connects with the local community. Discuss the unique needs of customers in ${companyInfo.location} and why this service is the perfect fit. Do not call the section "introduction".
          - Talk about how ${companyInfo.serviceName} is tailored to local conditions, needs, or regulations. How does this service solve problems that are unique to ${companyInfo.location}?
          - If possible, mention any specific local landmarks, events, or partnerships that tie the service to the area. 
          - Reassure the reader of the company's local expertise and presence, without making it sound like a marketing pitch—just speak naturally about the company's commitment to the area.
          - Close with a casual, approachable CTA. Encourage potential customers to reach out when they're ready, emphasizing convenience and ease. Do not call it "conclusion" or "CTA" or mention "call to action".
          
          The tone should be warm and conversational, ensuring the content speaks directly to the reader in ${companyInfo.location}, without being overly formal.`;
        break;

      case 'blog':
        prompt = `
          Write an engaging blog post for ${companyInfo.companyName}, a ${companyInfo.industry} company, about ${companyInfo.serviceName} services in ${companyInfo.location}.
          The blog should be informative but also relatable, using real-world examples, tips, and solutions that readers can easily apply.
          
          Structure the post to feel like a conversation, making it approachable for readers:
          - Start with an interesting hook that addresses a common question, challenge, or curiosity that the reader might have about ${companyInfo.serviceName}. Do not call the section "introduction".
          - Offer valuable insights into how ${companyInfo.serviceName} works, including tips and best practices that can help the reader get the most out of the service. 
          - Discuss common mistakes or challenges people encounter when considering or using this service, and provide simple, actionable solutions.
          - Weave in subtle points about why professional help can make a difference—without sounding like an advertisement. Focus on the value of experience and expertise.
          - End with a CTA that feels natural—suggest that the reader reach out for more information or assistance, but don't force it. Do not call it "conclusion" or "CTA" or mention "call to action".

          Keep the tone friendly and down-to-earth. Avoid generic headlines and instead, focus on making the content feel fresh, engaging, and personal. This blog should feel like a helpful conversation, not a sales pitch.`;
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
        model: "gpt-4o-mini",
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