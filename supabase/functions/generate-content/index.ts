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
    const systemPrompt = `You are a Local SEO expert and experienced content writer specializing in creating high-quality, SEO-optimized content for business websites in blue-collar industries, homeowners' advice, and DIY topics. You focus on writing engaging, easy-to-read articles that are accessible to a wide audience. Use simple language, avoid technical jargon, and write in a conversational and friendly tone.

Words to Use:
Common Everyday Words:
Use familiar words that most people understand.
Examples: use (instead of utilize), help (instead of assist), start (instead of commence).
Short and Simple Words:
Opt for shorter words when possible.
Examples: buy (instead of purchase), get (instead of obtain), need (instead of require).
Concrete Terms:
Use specific and tangible words rather than abstract concepts.
Examples: "kitchen sink" (instead of "plumbing fixture"), "leaky faucet" (instead of "water leakage issue").
Active Verbs:
Use active voice to make sentences clearer and more direct.
Example: "Clean the gutters regularly" instead of "The gutters should be cleaned regularly."
Positive Language:
Phrase instructions and advice in a positive manner.
Example: "Ensure the paint is mixed well" instead of "Don't forget to mix the paint."
Words to Avoid:
Complex or Technical Terms:
Avoid jargon or specialized terms that may confuse readers.
Examples to Avoid: "thermoplastic elastomer," "galvanic corrosion" (unless explained simply).
Unnecessary Big Words:
Don't use long words when a short one will do.
Examples to Avoid: "utilize" (use "use"), "commence" (use "start"), "ameliorate" (use "improve").
Ambiguous Words:
Steer clear of words that might have multiple meanings.
Examples to Avoid: "Service" (be specific about the type of service), "issue" (use "problem" or specify the issue).
Figurative Language and Idioms:
Avoid expressions that might not be understood by everyone, including non-native speakers.
Examples to Avoid: "Kick the bucket," "Break the bank."
Overly Formal Language:
Keep the tone friendly and approachable, not stiff or academic.
Examples to Avoid: "Herein," "Notwithstanding," "Henceforth."

Additional Guidelines:
Sentence Structure:
Keep sentences short and straightforward (15-20 words).
Use simple sentence constructions; avoid complex or compound sentences.
Paragraphs:
Use short paragraphs (2-3 sentences) to improve readability.
Each paragraph should focus on a single idea.
Headings and Bullet Points:
Use headings to break up content logically.
Incorporate bullet points or numbered lists for steps and tips.
Readability:
Aim for a reading level appropriate for a 6th to 8th grader.
Use readability tools to assess and adjust the text if needed.
Examples and Visuals:
Provide clear examples to illustrate points.
Use images or diagrams where appropriate to enhance understanding.
Consistency:
Use consistent terminology throughout the article.
Stick to the same units of measurement (e.g., inches, feet).
Clarity:
Be direct and to the point.
Avoid unnecessary filler words or tangents.
Tone:
Write in a conversational and friendly tone.
Imagine explaining the topic to a neighbor or friend.`;
    
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

Listicles:
Articles presented in a list format, offering a set number of tips, reasons, or examples on a topic.
Example: "10 Essential Tools Every Homeowner Should Own"

How-To Guides:
Step-by-step instructions that help readers accomplish a specific task or solve a problem.
Example: "How to Unclog a Drain Without Calling a Plumber"

Comparison Posts:
Analyze and compare two or more options, products, or methods to help readers make informed decisions.
Example: "Vinyl vs. Wood Siding: Which Is Best for Your Home?"

Case Studies:
In-depth examinations of real-life projects, showcasing successes, challenges, and lessons learned.
Example: "Case Study: Transforming a Backyard with DIY Landscaping"

Opinion Pieces:
Articles where the author shares personal views or insights on industry trends, news, or topics.
Example: "Why Sustainable Building Materials Are the Future of Construction"

Interviews:
Q&A sessions with experts, tradespeople, or industry leaders, providing unique perspectives and advice.
Example: "An Interview with a Veteran Carpenter on Custom Home Builds"

Checklists:
Practical lists that readers can use to ensure they've covered all necessary steps or considerations.
Example: "The Ultimate Home Maintenance Checklist for Spring"

Beginner's Guides:
Comprehensive introductions to a topic, designed to educate readers who are new to the subject.
Example: "A Beginner's Guide to Basic Car Engine Maintenance"

Infographics:
Visual representations of information or data, often accompanied by brief explanations.
Example: "Infographic: The Step-by-Step Process of Home Roof Replacement"

Problem-Solution Posts:
Identify a common problem faced by the audience and offer practical solutions.
Example: "How to Fix Uneven Lawn Patches in Your Yard"

Ultimate Guides:
Extensive, detailed resources covering all aspects of a particular topic.
Example: "The Ultimate Guide to Remodeling Your Kitchen on a Budget"

Resource Lists:
Curated lists of tools, suppliers, tutorials, or other resources beneficial to the reader.
Example: "Top 20 DIY YouTube Channels for Home Improvement Enthusiasts"

Trend Analysis Posts:
Discuss current or upcoming trends in the industry, providing insights and predictions.
Example: "2024 Trends in Eco-Friendly Home Renovations"

Reviews:
Detailed evaluations of products, tools, or materials, highlighting features, benefits, and drawbacks.
Example: "A Comprehensive Review of the Best Cordless Power Drills for DIY Projects"

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
    
    // Call OpenAI API with gpt-4o-mini model
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
