import { getRandomTemplate, serviceTitleTemplates, locationTitleTemplates, blogTitleTemplates } from "../titleTemplates";

export const createContentEntries = (
  companyId: string,
  services: { id: string; name: string }[],
  locations: { id: string; location: string }[]
) => {
  const entries = [];

  for (const service of services) {
    // Service page
    entries.push({
      company_id: companyId,
      service_id: service.id,
      title: getRandomTemplate(serviceTitleTemplates, { service: service.name }),
      type: "service",
      status: "pending",
    });

    // Location pages and blog posts
    for (const location of locations) {
      // Location page
      entries.push({
        company_id: companyId,
        service_id: service.id,
        location_id: location.id,
        title: getRandomTemplate(locationTitleTemplates, { 
          service: service.name,
          location: location.location 
        }),
        type: "location",
        status: "pending",
      });

      // 5 blog posts per service/location
      for (let i = 0; i < 5; i++) {
        entries.push({
          company_id: companyId,
          service_id: service.id,
          location_id: location.id,
          title: getRandomTemplate(blogTitleTemplates, {
            service: service.name,
            location: location.location
          }),
          type: "blog",
          status: "pending",
          blog_index: i, // Add the blog_index for blog posts
        });
      }
    }
  }

  return entries;
};