import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const baseSystemPrompt = `You are an expert content writer and SEO specialist who:
- Creates engaging, conversion-focused content
- Uses professional yet approachable language
- Excels at creating unique content across multiple pieces
- Understands local business needs and markets

When generating multiple pieces:
- Use different examples and case studies
- Draw from different industry aspects
- Vary perspectives while maintaining brand voice
- Use distinct data points and statistics`;

const sharedRequirements = {
  format: 'Write the content in Markdown format.',
  style: {
    tone: 'professional yet conversational',
    structure: 'use clear subheadings and scannable format',
    seo: 'incorporate natural keywords without forcing them',
  },
  elements: {
    cta: 'end with a natural call to action',
    value: 'focus on providing genuine value',
  }
};

const contentTemplates = {
  service: {
    sections: [
      'compelling introduction',
      'unique benefits and features',
      'service process',
      'quality standards',
      'experience and expertise'
    ],
    focus: 'service-specific value proposition'
  },
  location: {
    sections: [
      'local introduction',
      'area-specific solutions',
      'local experience',
      'community involvement',
      'location-specific benefits'
    ],
    focus: 'local market understanding'
  },
  blog: {
    sections: [
      'engaging hook',
      'practical information',
      'actionable advice',
      'relevant examples',
      'conclusion with CTA'
    ],
    focus: 'educational value'
  }
};

const getBlogTopics = (service: string) => [
  {
    topic: "Tips and Best Practices",
    prompt: `Create a comprehensive guide with essential tips and best practices for ${service}.`,
  },
  {
    topic: "Common Problems and Solutions",
    prompt: `Address the most common problems people face with ${service} and provide expert solutions.`,
  },
  {
    topic: "Cost and Value Guide",
    prompt: `Create an in-depth analysis of costs, value, and return on investment for ${service}.`,
  },
  {
    topic: "Seasonal Considerations",
    prompt: `Discuss how different seasons affect ${service} and provide season-specific advice.`,
  },
  {
    topic: "Latest Trends and Innovations",
    prompt: `Explore current trends, innovations, and future developments in ${service}.`,
  },
];

const buildPrompt = (type: string, companyInfo: any, blogIndex?: number) => {
  const template = contentTemplates[type as keyof typeof contentTemplates];
  let prompt = '';

  switch (type) {
    case 'service':
      prompt = `
        Create a comprehensive service page for ${companyInfo.companyName}, focusing on their ${companyInfo.serviceName} service.

        Structure the content to include:
        ${template.sections.map(section => `- ${section}`).join('\n')}
        
        ${sharedRequirements.format}
        Focus on: ${template.focus}
        ${Object.values(sharedRequirements.style).join('\n')}
        ${Object.values(sharedRequirements.elements).join('\n')}`;
      break;

    case 'location':
      prompt = `
        Create a location-specific service page for ${companyInfo.companyName}'s ${companyInfo.serviceName} service in ${companyInfo.location}.

        Structure the content to include:
        ${template.sections.map(section => `- ${section}`).join('\n')}
        
        ${sharedRequirements.format}
        Focus on: ${template.focus}
        ${Object.values(sharedRequirements.style).join('\n')}
        ${Object.values(sharedRequirements.elements).join('\n')}`;
      break;

    case 'blog':
      const topics = getBlogTopics(companyInfo.serviceName);
      const topicInfo = topics[blogIndex || 0];
      
      prompt = `
        ${topicInfo.prompt} This article will focus on ${companyInfo.location}.
        
        Make this a comprehensive, unique article about ${topicInfo.topic.toLowerCase()} for ${companyInfo.serviceName}.
    
        Structure the content to include:
        ${template.sections.map(section => `- ${section}`).join('\n')}
        
        ${sharedRequirements.format}
        Focus on: ${template.focus}
        ${Object.values(sharedRequirements.style).join('\n')}
        ${Object.values(sharedRequirements.elements).join('\n')}

        Note: Do not wrap the content in markdown code blocks or add any formatting indicators.`;
      break;
    
    default:
      throw new Error('Invalid content type specified');
  }

  return prompt;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { contentType, companyInfo, serviceId, locationId, blogIndex } = await req.json();
    console.log('Received request:', { contentType, companyInfo, serviceId, locationId, blogIndex });

    if (!contentType || !companyInfo || !serviceId || !companyInfo.companyId) {
      throw new Error('Missing required parameters');
    }

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    const prompt = buildPrompt(contentType, companyInfo, blogIndex);
    console.log('Using prompt:', prompt);
    
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: 'system', content: baseSystemPrompt },
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

    let generatedContent = completion.choices[0].message.content;
    generatedContent = generatedContent.replace(/^```markdown\n|^```\n|```$/gm, '').trim();
    
    console.log('Generated content:', generatedContent.substring(0, 100) + '...');

    // Update the query to include blog_index for blog posts
    const query = supabase
      .from('generated_content')
      .update({ 
        content: generatedContent,
        status: 'generated'
      })
      .eq('company_id', companyInfo.companyId)
      .eq('service_id', serviceId)
      .eq('type', contentType);

    // Add conditions based on content type
    if (contentType === 'blog') {
      query.eq('blog_index', blogIndex);
    }
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