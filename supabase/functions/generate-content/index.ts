import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const systemPrompt = `You are an expert content writer specializing in creating engaging, SEO-optimized content for business websites. 
Your content should be informative, well-structured, and optimized for both search engines and human readers.
Always write in a professional yet approachable tone, focusing on providing value to the reader.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { contentType, companyInfo, serviceId, locationId } = await req.json();
    console.log('Received request:', { contentType, companyInfo, serviceId, locationId });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let prompt;

    switch (contentType) {
      case 'service':
        prompt = `
**Task:**
Write a comprehensive service page for **${companyInfo.companyName}**, a ${companyInfo.industry} company, focusing on their **${companyInfo.serviceName}** service.

**Structure:**
1. **Introduction**: Provide a compelling overview of the service. Do not call it introduction, be smart with the headline to keep it engaging.
2. **Key Benefits and Features**: Highlight what sets this service apart. Do not call it Key Benefits and Features, be smart with the headline to keep it engaging.
3. **Why Choose ${companyInfo.companyName}**: Emphasize experience, expertise, and any certifications.
   - Include customer testimonials or success stories if available.
4. **Our ${companyInfo.serviceName} Process**: Describe step-by-step what customers can expect. Do not call it Our ${companyInfo.serviceName} Process, be smart with the headline to keep it engaging.
5. **Common Problems We Solve**: Address typical issues and how the service provides solutions.
6. **Call to Action**: Encourage readers to contact or schedule a service. Do not call it Call to Action, be smart with the headline to keep it engaging.

**Requirements:**
- Write the content in **SEO-friendly Markdown** format.
- Use appropriate headings (**H1**, **H2**, **H3**, **H4**) to organize the content.
- Ensure proper spacing and formatting for readability.
- Demonstrate **Experience**, **Expertise**, **Authoritativeness**, and **Trustworthiness** (EEAT) throughout the content.
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
- Aim for **800-1000 words**.
- Before finalizing, review the content to ensure it meets all guidelines and is error-free.
`;
        break;
      
      case 'location':
        prompt = `
**Task:**
Write a location-specific service page for **${companyInfo.companyName}**'s **${companyInfo.serviceName}** service in **${companyInfo.location}**.

**Structure:**
1. **Introduction**: Provide a compelling overview with local context. Do not call it introduction, be smart with the headline to keep it engaging.
2. **Our ${companyInfo.serviceName} Services in ${companyInfo.location}**: Detail the services offered. Be creative with the headline.
3. **Why Choose ${companyInfo.companyName} in ${companyInfo.location}**: Highlight local experience and community involvement.
   - Include testimonials from local customers if available.
4. **Local Service Coverage**: Mention specific areas or neighborhoods served.
5. **${companyInfo.location}-Specific Benefits**: Discuss local conditions that make the service valuable.
6. **Contact Information and Call to Action**: Provide clear instructions on how to get in touch. Do not call it Contact Information and Call to Action, be smart with the headline to keep it engaging.

**Requirements:**
- Write the content in **SEO-friendly Markdown** format.
- Use appropriate headings (**H1**, **H2**, **H3**, **H4**) to organize the content.
- Ensure proper spacing and formatting for readability.
- Demonstrate **Experience**, **Expertise**, **Authoritativeness**, and **Trustworthiness** (EEAT) throughout the content.
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
- Aim for **600-800 words**.
- Before finalizing, review the content to ensure it meets all guidelines and is error-free.
`;
        break;
      
      case 'blog':
        prompt = `
**Task:**
Write an informative blog post about **${companyInfo.serviceName}** services${companyInfo.location ? ` in ${companyInfo.location}` : ''} for **${companyInfo.companyName}**, a ${companyInfo.industry} company.

**Structure:**
1. **Introduction**: Hook readers with a compelling opening. Do not call it introduction, be smart with the headline to keep it engaging.
2. **Main Content**: Provide valuable insights and information. Do not call the headline main content, be creative and relatable.
3. **Expert Tips**: Share professional advice and best practices.
4. **Local Context**: Include relevant local information when applicable. Do not call the headline local context. Be smart.
5. **Conclusion**: Summarize key points and include a call to action. Do not call it conclusion. 

**Requirements:**
- Write the content in **SEO-friendly Markdown** format.
- Use appropriate headings (**H1**, **H2**, **H3**, **H4**) to organize the content.
- Ensure proper spacing and formatting for readability.
- Demonstrate **Experience**, **Expertise**, **Authoritativeness**, and **Trustworthiness** (EEAT).
- Write in a conversational and friendly tone, using simple language.
- Keep sentences short and straightforward (15-20 words).
- Use short paragraphs (2-3 sentences) focusing on a single idea.
- Incorporate bullet points or numbered lists where appropriate.
- Include relevant examples or case studies.
- Focus on providing actionable advice and practical tips.
- Optimize for both local and service-related keywords naturally.
- Aim for **800-1000 words**.
- Before finalizing, review the content to ensure it meets all guidelines and is error-free.
`;
        break;
      
      default:
        throw new Error('Invalid content type specified');
    }

    console.log('Calling OpenAI with prompt length:', prompt.length);
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('OpenAI API key not found');
      throw new Error('OpenAI API key not configured');
    }

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${errorText}`);
    }

    const completion = await openAIResponse.json();
    console.log('OpenAI response received, content length:', completion.choices[0].message.content.length);

    // Update content in database
    const { data: contentData, error: contentError } = await supabase
      .from("generated_content")
      .update({
        content: completion.choices[0].message.content,
        status: "generated",
      })
      .eq("id", companyInfo.contentId)
      .select();

    if (contentError) {
      console.error('Error updating content in database:', contentError);
      throw contentError;
    }

    console.log('Content updated successfully:', contentData);

    return new Response(
      JSON.stringify({ content: completion.choices[0].message.content }),
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
