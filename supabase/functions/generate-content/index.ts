import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const blogTypes = [
  {
    type: 'how-to',
    titleTemplate: 'The Complete Step-by-Step Guide to {service} in {location}',
    systemPromptAddition: 'You are a professional instructor creating a detailed, step-by-step tutorial. Focus on practical instructions, common pitfalls, and expert tips.',
    contentStructure: 'Structure as a comprehensive tutorial with clear steps, prerequisites, and expected outcomes.'
  },
  {
    type: 'comparison',
    titleTemplate: 'Professional vs DIY {service}: A Complete Guide for {location} Residents',
    systemPromptAddition: 'You are an expert analyst comparing different approaches. Focus on objective comparisons, highlighting pros, cons, and specific scenarios.',
    contentStructure: 'Structure as a detailed comparison with clear points of difference, cost analysis, and specific recommendations.'
  },
  {
    type: 'tips',
    titleTemplate: 'Essential {service} Tips and Best Practices for {location} Property Owners',
    systemPromptAddition: 'You are an industry insider sharing valuable tips and secrets. Focus on practical, actionable advice that readers can implement immediately.',
    contentStructure: 'Structure as a collection of expert tips, each with clear implementation guidance and expected benefits.'
  },
  {
    type: 'seasonal',
    titleTemplate: 'Seasonal Guide to {service} in {location}: What You Need to Know',
    systemPromptAddition: 'You are a seasonal planning expert. Focus on how weather and timing affect service delivery and maintenance requirements.',
    contentStructure: 'Structure around seasonal considerations, timing, and environmental factors specific to the location.'
  },
  {
    type: 'cost',
    titleTemplate: '{service} Costs in {location}: A Comprehensive Price Guide',
    systemPromptAddition: 'You are a cost analysis expert. Focus on providing detailed pricing information, budget considerations, and value analysis.',
    contentStructure: 'Structure with clear price breakdowns, cost factors, and ROI analysis specific to the location.'
  }
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { contentType, companyInfo, serviceId, locationId } = await req.json();
    console.log('Received request:', { contentType, companyInfo, serviceId, locationId });

    if (!contentType || !companyInfo || !serviceId || !companyInfo.companyId) {
      throw new Error('Missing required parameters');
    }

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    let prompt = '';
    const systemPrompt = `You are an expert content writer and SEO specialist with deep experience in creating engaging, conversion-focused content for local businesses. Your writing style is professional yet approachable, using clear language that resonates with both consumers and business clients.`;

    if (contentType === 'blog') {
      const blogTypeIndex = Math.floor(Math.random() * blogTypes.length);
      const blogType = blogTypes[blogTypeIndex];
      
      const title = blogType.titleTemplate
        .replace('{service}', companyInfo.serviceName)
        .replace('{location}', companyInfo.location);

      const customSystemPrompt = `${systemPrompt} ${blogType.systemPromptAddition}`;
      
      prompt = `
        Create a unique and informative blog post titled "${title}" for ${companyInfo.companyName}'s audience in ${companyInfo.location}.
        
        ${blogType.contentStructure}
        
        Key requirements:
        - Write in a professional yet conversational tone
        - Include specific examples relevant to ${companyInfo.location}
        - Focus on providing actionable value to readers
        - Include relevant statistics or data points when possible
        - Maintain SEO-friendly structure without keyword stuffing
        - Keep paragraphs short and scannable
        
        Write the content in Markdown format.`;
    } else if (contentType === 'service') {
      prompt = `
        Create a comprehensive service page for ${companyInfo.companyName}, a respected ${companyInfo.industry} company, focusing on their ${companyInfo.serviceName} service. 

        Structure the content to:
        1. Open with a compelling introduction that immediately addresses the reader's needs and pain points
        2. Highlight the unique benefits and features of ${companyInfo.serviceName}, explaining why they matter to the customer
        3. Include specific details about:
           - The service process and what customers can expect
           - Quality standards and professional certifications
           - Typical problems solved and outcomes achieved
           - Relevant experience and expertise in this service area
        4. Address common customer questions and concerns
        5. End with a clear, compelling call to action. Do not call this headline "Call to action" or "conclusion" make it natural.

        Key requirements:
        - Use a professional yet conversational tone
        - Use natural headlines and headings, that are relevant to the content
        - Include specific details about ${companyInfo.serviceName} that set it apart
        - Focus on value and benefits rather than just features
        - Incorporate natural SEO keywords without keyword stuffing
        - Keep paragraphs short and scannable
        - Use subheadings to break up content

        Write the content in Markdown format.`;
    } else if (contentType === 'location') {
      prompt = `
        Create a location-specific service page for ${companyInfo.companyName}'s ${companyInfo.serviceName} service in ${companyInfo.location}.

        Structure the content to:
        1. Open with a locally-focused introduction that connects with the ${companyInfo.location} community
        2. Explain how ${companyInfo.serviceName} is specifically tailored to:
           - Local needs and preferences in ${companyInfo.location}
           - Regional challenges or requirements
           - Area-specific regulations or standards
        3. Include details about:
           - Local service coverage and response times
           - Experience serving the ${companyInfo.location} area
           - Understanding of local market conditions
        4. Highlight any community involvement or local partnerships
        5. End with a location-specific call to action. Do not call this headline "Call to action" or "conclusion" make it natural.

        Key requirements:
        - Incorporate local landmarks or area-specific references naturally
        - Address specific needs of ${companyInfo.location} customers
        - Use natural headlines and headings, that are relevant to the content
        - Include local SEO elements without forcing them
        - Maintain a neighborly yet professional tone
        - Use clear subheadings and scannable format
        - Keep content focused on local relevance
        
        Write the content in Markdown format.`;
    }

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4o mini",
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
    console.log('Generated content:', generatedContent.substring(0, 100) + '...');

    const query = supabase
      .from('generated_content')
      .update({ 
        content: generatedContent,
        status: 'generated'
      })
      .eq('company_id', companyInfo.companyId)
      .eq('service_id', serviceId)
      .eq('type', contentType);

    if (locationId) {
      query.eq('location_id', locationId);
    } else {
      query.is('location_id', null);
    }

    const { error: updateError } = await query;

    if (updateError) {
      console.error('Database update error:', updateError);
      throw updateError;
    }

    console.log('Content successfully updated in database');

    return new Response(
      JSON.stringify({ 
        success: true,
        content: generatedContent 
      }),
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
