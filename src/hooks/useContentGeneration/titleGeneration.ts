import { supabase } from "@/integrations/supabase/client";
import type { CompanyData, ServiceData, LocationData } from "./types";

export async function generateTitle(
  contentType: "service" | "location" | "blog",
  companyInfo: {
    companyName: string;
    industry: string;
    serviceName: string;
  },
  location?: string
): Promise<string> {
  try {
    // Create content-type specific prompts
    let prompt = '';
    switch (contentType) {
      case 'service':
        prompt = `
You are an experienced copywriter specializing in creating engaging and natural-sounding titles for service pages in the ${companyInfo.industry} industry.

Please generate a compelling and natural title for a **service page** for **${companyInfo.companyName}** that offers **${companyInfo.serviceName}** services.

**Guidelines:**
- Keep the title concise (60 characters or less).
- Use natural language that appeals to the target audience.
- Make it stand out and accurately reflect the service.
- Use title case capitalization.
`;
        break;
      case 'location':
        prompt = `
You are an experienced copywriter specializing in creating engaging and natural-sounding titles for location-specific service pages in the ${companyInfo.industry} industry.

Please generate a compelling and natural title for a **location-specific service page** for **${companyInfo.companyName}**, focusing on **${companyInfo.serviceName}** services in **${location}**.

**Guidelines:**
- Keep the title concise (60 characters or less).
- Naturally include the location in the title.
- Appeal to the local audience.
- Use title case capitalization.
`;
        break;
      case 'blog':
        prompt = `
You are an experienced copywriter specializing in creating engaging and natural-sounding titles for blog posts in the ${companyInfo.industry} industry.

Please generate a compelling and natural title for a **blog post** for **${companyInfo.companyName}** about **${companyInfo.serviceName}** services${location ? ` in ${location}` : ''}.

**Guidelines:**
- Keep the title concise (60 characters or less).
- Make it interesting and informative.
- Use natural language that resonates with homeowners and DIY enthusiasts.
- Use title case capitalization.
`;
        break;
      default:
        prompt = `
Please generate a title for ${companyInfo.serviceName} services by ${companyInfo.companyName}.
`;
    }

    const { data, error } = await supabase.functions.invoke("generate-titles", {
      body: { contentType, companyInfo, location, prompt },
    });

    if (error) throw error;
    return data.title || generateFallbackTitle(contentType, companyInfo, location);
  } catch (error) {
    console.error("Error generating title:", error);
    return generateFallbackTitle(contentType, companyInfo, location);
  }
}

// Updated fallback title generator for more natural titles
function generateFallbackTitle(
  contentType: "service" | "location" | "blog",
  companyInfo: { companyName: string; industry: string; serviceName: string },
  location?: string
): string {
  let title = "";
  switch (contentType) 
  return title;
}

export async function createContentEntries(
  companyData: CompanyData,
  servicesData: ServiceData[],
  locationsData: LocationData[],
  businessInfo: { companyName: string; industry: string }
) {
  const contentEntries = [];

  // Generate titles for service pages
  for (const service of servicesData) {
    if (!service?.id) continue;
    const title = await generateTitle("service", {
      companyName: businessInfo.companyName,
      industry: businessInfo.industry,
      serviceName: service.name,
    });

    contentEntries.push({
      company_id: companyData.id,
      service_id: service.id,
      title,
      type: "service",
    });
  }

  // Generate titles for location pages and blog posts
  for (const service of servicesData) {
    if (!service?.id) continue;
    for (const location of locationsData) {
      if (!location?.id) continue;

      const locationTitle = await generateTitle(
        "location",
        {
          companyName: businessInfo.companyName,
          industry: businessInfo.industry,
          serviceName: service.name,
        },
        location.location
      );

      contentEntries.push({
        company_id: companyData.id,
        service_id: service.id,
        location_id: location.id,
        title: locationTitle,
        type: "location",
      });

      const blogTitle = await generateTitle(
        "blog",
        {
          companyName: businessInfo.companyName,
          industry: businessInfo.industry,
          serviceName: service.name,
        },
        location.location
      );

      contentEntries.push({
        company_id: companyData.id,
        service_id: service.id,
        location_id: location.id,
        title: blogTitle,
        type: "blog",
      });
    }
  }

  return contentEntries;
}
