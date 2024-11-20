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
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
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

**Writing Guidelines:**
- Use H2 and H3 headings for sections.
- Write in a conversational and friendly tone, using simple language.
- **Words to Use:** Common everyday words, short and simple words, concrete terms, active verbs, positive language.
- **Words to Avoid:** Complex or technical terms, unnecessary big words, ambiguous words, figurative language, overly formal language.
- Keep sentences short and straightforward (15-20 words).
- Use short paragraphs (2-3 sentences) focusing on a single idea.
- Incorporate bullet points or numbered lists where appropriate.
- Aim for a 6th to 8th-grade reading level.
- Be direct and to the point.
- Focus on value proposition and address customer needs and pain points.
- Include relevant keywords naturally (avoid keyword stuffing).
- Aim for 800-1000 words.
- Before finalizing, review the content to ensure it meets all guidelines and is error-free.
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

**Writing Guidelines:**
- Use H2 and H3 headings for sections.
- Include local landmarks, events, or community initiatives to strengthen local connections.
- Write in a conversational and friendly tone, using simple language.
- **Words to Use:** Common everyday words, short and simple words, concrete terms, active verbs, positive language.
- **Words to Avoid:** Complex or technical terms, unnecessary big words, ambiguous words, figurative language, overly formal language.
- Keep sentences short and straightforward (15-20 words).
- Use short paragraphs (2-3 sentences) focusing on a single idea.
- Incorporate bullet points or numbered lists where appropriate.
- Aim for a 6th to 8th-grade reading level.
- Be direct and to the point.
- Optimize for local SEO with location-specific keywords (avoid keyword stuffing).
- Address the needs and pain points of local customers.
- Emphasize the local expertise of the service provider.
- Aim for 600-800 words.
- Before finalizing, review the content to ensure it meets all guidelines and is error-free.
`;
        break;
      
      case 'blog':
        prompt = `
**Task:**
Write an informative blog post for **${companyInfo.companyName}**, a ${companyInfo.industry} company, about **${companyInfo.serviceName}** services${companyInfo.location ? ` in ${companyInfo.location}` : ''}.

**Choose one of the following blog post types that best suits the topic and audience:**

- **Listicles**: Articles in list format offering tips, reasons, or examples.
- **How-To Guides**: Step-by-step instructions to accomplish a task or solve a problem.
- **Comparison Posts**: Analyze and compare options, products, or methods.
- **Case Studies**: In-depth examinations of real-life projects.
- **Opinion Pieces**: Share personal views or insights on industry trends.
- **Interviews**: Q&A sessions with experts, providing unique perspectives.
- **Checklists**: Practical lists to ensure all steps are covered.
- **Beginner's Guides**: Comprehensive introductions for those new to the subject.
- **Problem-Solution Posts**: Identify common problems and offer solutions.
- **Ultimate Guides**: Extensive resources covering all aspects of a topic.
- **Resource Lists**: Curated lists of tools, suppliers, or tutorials.
- **Trend Analysis Posts**: Discuss current or upcoming industry trends.
- **Reviews**: Detailed evaluations of products or services.

**Writing Guidelines:**
- Structure the content appropriately based on the chosen blog post type.
- Use H2 and H3 headings for sections.
- Write in a conversational and friendly tone, using simple language.
- **Words to Use:** Common everyday words, short and simple words, concrete terms, active verbs, positive language.
- **Words to Avoid:** Complex or technical terms, unnecessary big words, ambiguous words, figurative language, overly formal language.
- Keep sentences short and straightforward (15-20 words).
- Use short paragraphs (2-3 sentences) focusing on a single idea.
- Incorporate bullet points or numbered lists where appropriate.
- Include actionable advice and practical tips.
- Include relevant examples or statistics.
- Include local context, referencing local landmarks or community aspects where appropriate.
- Address the needs and pain points of local customers.
- Emphasize the local expertise of the service provider.
- Optimize for both local and service-related keywords naturally (avoid keyword stuffing).
- Aim for 800-1000 words.
- Before finalizing, review the content to ensure it meets all guidelines and is error-free.
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
