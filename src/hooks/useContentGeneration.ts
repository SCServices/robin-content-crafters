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
    const systemPrompt = `You are a professional content writer specializing in creating high-quality, SEO-optimized content for business websites in blue-collar industries, homeowners' advice, and DIY topics. Your writing is engaging, easy to read, and accessible to a wide audience. You use simple language, avoid technical jargon, and write in a conversational and friendly tone.`;

    // Construct prompt based on content type
    switch (contentType) {
      case 'service':
        prompt = `
**Task:**
Write a comprehensive service page for **${companyInfo.companyName}**, a ${companyInfo.industry} company, focusing on their **${companyInfo.serviceName}** service.

**Structure:**
1. **Introduction**: Provide a compelling overview of the service.
2. **Key Benefits and Features**: Highlight what sets this service apart.
3. **Why Choose ${companyInfo.companyName}**: Emphasize experience, expertise, and any certifications.
   - Include customer testimonials or success stories if available.
4. **Our ${companyInfo.serviceName} Process**: Describe step-by-step what customers can expect.
5. **Common Problems We Solve**: Address typical issues and how the service provides solutions.
6. **Call to Action**: Encourage readers to contact or schedule a service.

**Requirements:**
- Use H2 and H3 headings for sections.
- Keep the tone professional but approachable.
- Write in simple language, avoiding technical jargon.
- Use active voice and positive language.
- Naturally include relevant keywords (avoid keyword stuffing).
- Focus on the value proposition and address customer needs.
- Aim for 800-1000 words.
- Ensure all information is accurate and up-to-date.
- Before finalizing, review the content to ensure it meets all guidelines and is error-free.

**Writing Guidelines:**
- Use common everyday words (e.g., "use" instead of "utilize").
- Keep sentences short and straightforward (15-20 words).
- Use short paragraphs (2-3 sentences) focusing on a single idea.
- Incorporate bullet points or numbered lists where appropriate.
- Aim for a 6th to 8th-grade reading level.
- Be direct and to the point.
- Imagine explaining the topic to a neighbor or friend.
`;
        break;
      
      case 'location':
        prompt = `
**Task:**
Write a location-specific service page for **${companyInfo.companyName}**'s **${companyInfo.serviceName}** service in **${companyInfo.location}**.

**Structure:**
1. **Introduction**: Provide a compelling overview with local context.
2. **Our ${companyInfo.serviceName} Services in ${companyInfo.location}**: Detail the services offered.
3. **Why Choose ${companyInfo.companyName} in ${companyInfo.location}**: Highlight local experience and community involvement.
   - Include testimonials from local customers if available.
4. **Local Service Coverage**: Mention specific areas or neighborhoods served.
5. **${companyInfo.location}-Specific Benefits**: Discuss local conditions that make the service valuable.
6. **Contact Information and Call to Action**: Provide clear instructions on how to get in touch.

**Requirements:**
- Use H2 and H3 headings for sections.
- Include local landmarks, events, or community initiatives to strengthen local connections.
- Write in simple language, avoiding technical jargon.
- Use active voice and positive language.
- Optimize for local SEO with location-specific keywords (avoid keyword stuffing).
- Address the needs and pain points of local customers.
- Emphasize the local expertise of the service provider.
- Aim for 600-800 words.
- Ensure all information is accurate and up-to-date.
- Before finalizing, review the content to ensure it meets all guidelines and is error-free.

**Writing Guidelines:**
- Use common everyday words (e.g., "buy" instead of "purchase").
- Keep sentences short and straightforward (15-20 words).
- Use short paragraphs (2-3 sentences) focusing on a single idea.
- Incorporate bullet points or numbered lists where appropriate.
- Aim for a 6th to 8th-grade reading level.
- Be direct and to the point.
- Imagine explaining the topic to a neighbor or friend.
`;
        break;
      
      case 'blog':
        prompt = `
**Task:**
Write an informative blog post for **${companyInfo.companyName}**, a ${companyInfo.industry} company, about **${companyInfo.serviceName}** services${companyInfo.location ? ` in ${companyInfo.location}` : ''}.

**Choose one of the following blog post types that best suits the topic and audience:**

- **Listicle**: Present tips, reasons, or examples in a list format.
- **How-To Guide**: Provide step-by-step instructions to accomplish a task.
- **Comparison Post**: Analyze and compare options, products, or methods.
- **Case Study**: Examine a real-life project, showcasing successes and lessons learned.
- **Beginner's Guide**: Offer a comprehensive introduction to a topic.
- **Problem-Solution Post**: Identify a common problem and offer practical solutions.
- **Trend Analysis Post**: Discuss current or upcoming industry trends.
- **Review**: Evaluate products, tools, or materials relevant to the service.

**Structure:**
- Organize the content appropriately based on the chosen blog post type.
- Use engaging headings and subheadings.

**Requirements:**
- Use H2 and H3 headings for sections.
- Write in simple language, avoiding technical jargon.
- Use active voice and positive language.
- Include actionable advice and practical tips.
- Incorporate relevant examples or statistics.
- Include local context, referencing local landmarks or community aspects where appropriate.
- Address the needs and pain points of local customers.
- Emphasize the local expertise of the service provider.
- Optimize for both local and service-related keywords naturally (avoid keyword stuffing).
- Aim for 800-1000 words.
- Ensure all information is accurate and up-to-date.
- Before finalizing, review the content to ensure it meets all guidelines and is error-free.

**Writing Guidelines:**
- Use common everyday words (e.g., "get" instead of "obtain").
- Keep sentences short and straightforward (15-20 words).
- Use short paragraphs (2-3 sentences) focusing on a single idea.
- Incorporate bullet points or numbered lists where appropriate.
- Aim for a 6th to 8th-grade reading level.
- Be direct and to the point.
- Imagine explaining the topic to a neighbor or friend.
`;
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
        model: 'gpt-4',
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
