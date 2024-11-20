import { supabase } from "@/integrations/supabase/client";
import { 
  serviceTitleTemplates, 
  locationTitleTemplates, 
  blogTitleTemplates,
  getRandomTemplate 
} from "./titleTemplates";

export const generateTitle = async (type: "service" | "location" | "blog", data: {
  companyName: string;
  industry: string;
  service: string;
  location?: string;
}) => {
  const prompt = getPromptForType(type, data);

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are a professional SEO copywriter specializing in creating engaging, SEO-optimized titles and headlines. Your titles are clear, compelling, and optimized for search engines while maintaining readability and appeal to human readers.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 60,
      }),
    });

    if (!response.ok) {
      throw new Error('OpenAI API request failed');
    }

    const result = await response.json();
    const title = result.choices[0].message.content.trim();
    return title;
  } catch (error) {
    console.error("Error generating title with OpenAI:", error);
    return getDefaultTitle(type, data);
  }
};

const getPromptForType = (type: "service" | "location" | "blog", data: {
  companyName: string;
  industry: string;
  service: string;
  location?: string;
}) => {
  switch (type) {
    case "service":
      return `Create a compelling, SEO-optimized title for a service page about ${data.service} services offered by ${data.companyName}, a ${data.industry} company. The title should be concise (under 60 characters) and include the main service and company name.`;
    case "location":
      return `Create a location-specific, SEO-optimized title for ${data.service} services offered by ${data.companyName} in ${data.location}. The title should be concise (under 60 characters) and include the service, location, and company name.`;
    case "blog":
      return `Create an engaging, SEO-optimized blog post title about ${data.service} services in ${data.location}. The title should be attention-grabbing and informative, targeting customers looking for ${data.industry} services. Include numbers or specific benefits if possible.`;
  }
};

export const getDefaultTitle = (type: "service" | "location" | "blog", data: {
  companyName: string;
  service: string;
  location?: string;
}) => {
  const replacements = {
    service: data.service,
    location: data.location || "",
    companyName: data.companyName
  };

  switch (type) {
    case "service":
      return getRandomTemplate(serviceTitleTemplates, replacements);
    case "location":
      return getRandomTemplate(locationTitleTemplates, replacements);
    case "blog":
      return getRandomTemplate(blogTitleTemplates, replacements);
    default:
      return `${data.companyName} - ${data.service}`;
  }
};