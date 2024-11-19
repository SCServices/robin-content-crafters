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
  const { data, error } = await supabase.functions.invoke("generate-titles", {
    body: { contentType, companyInfo, location },
  });

  if (error) throw error;
  return data.title || `${companyInfo.serviceName} Services - ${companyInfo.companyName}`;
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