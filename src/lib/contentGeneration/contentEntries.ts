import { getRandomTemplate, serviceTitleTemplates, locationTitleTemplates, blogTitleTemplates } from "../titleTemplates";

const getUniqueTemplate = (templates: string[], usedTemplates: Set<string>, replacements: Record<string, string>): string => {
  const availableTemplates = templates.filter(template => !usedTemplates.has(template));
  
  if (availableTemplates.length === 0) {
    // If all templates have been used, clear the set and start over
    usedTemplates.clear();
    return getRandomTemplate(templates, replacements);
  }
  
  const template = availableTemplates[Math.floor(Math.random() * availableTemplates.length)];
  usedTemplates.add(template);
  return getRandomTemplate([template], replacements);
};

export const createContentEntries = (
  companyId: string,
  services: { id: string; name: string }[],
  locations: { id: string; location: string }[]
) => {
  const entries = [];
  const usedServiceTemplates = new Set<string>();
  const usedLocationTemplates = new Set<string>();
  const usedBlogTemplates = new Set<string>();

  for (const service of services) {
    // Service page
    entries.push({
      company_id: companyId,
      service_id: service.id,
      title: getUniqueTemplate(serviceTitleTemplates, usedServiceTemplates, { service: service.name }),
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
        title: getUniqueTemplate(locationTitleTemplates, usedLocationTemplates, { 
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
          title: getUniqueTemplate(blogTitleTemplates, usedBlogTemplates, {
            service: service.name,
            location: location.location
          }),
          type: "blog",
          status: "pending",
          blog_index: i,
        });
      }
    }
  }

  return entries;
};