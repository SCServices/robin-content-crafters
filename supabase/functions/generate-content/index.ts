import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { contentType, companyInfo, serviceId, locationId, model = "gpt-4o-mini" } = await req.json();
    
    console.log('Received request:', { contentType, companyInfo, serviceId, locationId });

    // Validate required parameters
    if (!contentType || !companyInfo || !serviceId || !companyInfo.companyId) {
      throw new Error('Missing required parameters');
    }

    let prompt = '';
    const systemPrompt = `You are an expert content writer and SEO specialist with deep experience in creating engaging, conversion-focused content for local businesses. Your writing style is professional yet approachable, using clear language that resonates with both consumers and business clients. Focus on creating content that:
    - Demonstrates deep understanding of the industry and local market
    - Builds trust through expertise and credibility
    - Includes natural, contextual calls-to-action
    - Optimizes for local SEO without compromising readability
    - Uses a warm, professional tone that connects with readers`;
    
    switch (contentType) {
      case 'service':
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
          5. End with a clear, compelling call to action

          Key requirements:
          - Use a professional yet conversational tone
          - Include specific details about ${companyInfo.serviceName} that set it apart
          - Focus on value and benefits rather than just features
          - Incorporate natural SEO keywords without keyword stuffing
          - Keep paragraphs short and scannable
          - Use subheadings to break up content
          - End with a natural call to action that encourages contact

          Write the content in Markdown format.`;
        break;

      case 'location':
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
          5. End with a location-specific call to action

          Key requirements:
          - Incorporate local landmarks or area-specific references naturally
          - Address specific needs of ${companyInfo.location} customers
          - Include local SEO elements without forcing them
          - Maintain a neighborly yet professional tone
          - Use clear subheadings and scannable format
          - Keep content focused on local relevance
          
          Write the content in Markdown format.`;
        break;

      case 'blog':
        prompt = `
          Create an informative blog post about ${companyInfo.serviceName} for ${companyInfo.companyName}'s audience in ${companyInfo.location}.

          Structure the content to:
          1. Start with an engaging hook that relates to ${companyInfo.location} readers
          2. Include practical information about:
             - Common challenges or questions about ${companyInfo.serviceName}
             - Professional insights and expert tips
             - Industry best practices
             - Cost-saving or efficiency-improving strategies
          3. Provide actionable advice readers can use
          4. Include relevant examples or case studies
          5. End with a subtle call to action

          Key requirements:
          - Use a helpful, conversational tone
          - Include practical tips and actionable advice
          - Reference local context when relevant
          - Break up text with subheadings and bullet points
          - Focus on providing genuine value
          - Keep the promotional aspect subtle
          - Include relevant statistics or data points when possible

          Write the content in Markdown format.`
          
          For each blog post, randomly choose one of the following headline styles and narratives:
          // Listicles
        `10 Essential Tips for ${service.name} in ${location.location}`,
        `7 Reasons to Choose Professional ${service.name} Services in ${location.location}`,
        `5 Common ${service.name} Mistakes and How to Avoid Them`,
        // How-To Guides
        `How to Get the Best ${service.name} in ${location.location}`,
        `A Step-by-Step Guide to ${service.name} for ${location.location} Homeowners`,
        `How to Save Money on ${service.name} Services in ${location.location}`,
        // Comparison Posts
        `${service.name} Options in ${location.location}: DIY vs. Professional Services`,
        `Comparing Top ${service.name} Providers in ${location.location}`,
        // Case Studies
        `Case Study: Successful ${service.name} Projects in ${location.location}`,
        `Real-Life Examples of ${service.name} Solutions in ${location.location}`,
        // Opinion Pieces
        `Why ${service.name} is Essential for ${location.location} Residents`,
        `The Importance of Quality ${service.name} in ${location.location}`,
        // Checklists
        `The Ultimate ${service.name} Checklist for ${location.location} Homeowners`,
        `Don't Miss These Steps for Effective ${service.name} in ${location.location}`,
        // Beginner's Guides
        `A Beginner's Guide to ${service.name} in ${location.location}`,
        `Everything You Need to Know About ${service.name} in ${location.location}`,
        // Problem-Solution Posts
        `Common ${service.name} Problems in ${location.location} and How to Fix Them`,
        `How to Overcome ${service.name} Challenges in ${location.location}`,
        // Ultimate Guides
        `The Ultimate Guide to ${service.name} in ${location.location}`,
        `Comprehensive Resource for ${service.name} Services in ${location.location}`,
        // Resource Lists
        `Top 10 Resources for ${service.name} in ${location.location}`,
        `Best Tools and Services for ${service.name} in ${location.location}`,
        // Trend Analysis Posts
        `Latest Trends in ${service.name} for ${location.location}`,
        `What’s New in ${service.name}: ${location.location} Edition`,
        // Reviews
        `An Honest Review of ${service.name} Services in ${location.location}`,
        `Comparing the Best ${service.name} Products for ${location.location} Homes`,
        // Additional Titles
        `Tips for Choosing the Right ${service.name} in ${location.location}`,
        `Why Invest in Professional ${service.name} Services in ${location.location}`,
        `How Weather in ${location.location} Affects Your ${service.name} Needs`,
        `Expert Advice on ${service.name} for ${location.location} Residents`,
        `Avoid These ${service.name} Pitfalls in ${location.location}`,
        `Maximizing the Benefits of ${service.name} in ${location.location}`,
        `Seasonal Guide to ${service.name} in ${location.location}`,
        `Environmental Impact of ${service.name} Choices in ${location.location}`,
        `Frequently Asked Questions About ${service.name} in ${location.location}`,
        `Understanding the Costs of ${service.name} in ${location.location}`,;
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
    const { error: updateError } = await fetch(`${supabaseUrl}/rest/v1/generated_content`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ 
        content: generatedContent,
        status: 'generated'
      }),
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
