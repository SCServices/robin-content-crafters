import { getRandomTemplate, serviceTitleTemplates, locationTitleTemplates, blogTitleTemplates } from "@/lib/titleTemplates";

export const createContentEntries = (
  companyId: string,
  servicesData: any[],
  locationsData: any[]
) => {
  const contentEntries = [];

  // Service pages
  for (const service of servicesData) {
    if (!service?.id) continue;
    contentEntries.push({
      company_id: companyId,
      service_id: service.id,
      title: getRandomTemplate(serviceTitleTemplates, { service: service.name }),
      type: "service",
    });
  }

  // Location pages and blog posts
  for (const service of servicesData) {
    if (!service?.id) continue;
    for (const location of locationsData) {
      if (!location?.id) continue;
      // Add location page
      contentEntries.push({
        company_id: companyId,
        service_id: service.id,
        location_id: location.id,
        title: getRandomTemplate(locationTitleTemplates, { 
          service: service.name,
          location: location.location 
        }),
        type: "location",
      });

      // Add 5 blog posts for each service/location combination
      for (let i = 0; i < 5; i++) {
        contentEntries.push({
          company_id: companyId,
          service_id: service.id,
          location_id: location.id,
          title: getRandomTemplate(blogTitleTemplates, {
            service: service.name,
            location: location.location
          }),
          type: "blog",
        });
      }
    }
  }

  return contentEntries;
};