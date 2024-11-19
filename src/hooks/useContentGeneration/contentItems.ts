import type { BusinessInfo, ContentItem } from "@/lib/types";

// Functions to generate more descriptive and natural titles
function generateServicePageTitle(service: string, companyName: string): string {
  const templates = [
    `Expert ${service} Services by ${companyName}`,
    `${companyName}: Your Trusted ${service} Provider`,
    `Professional ${service} Solutions from ${companyName}`,
    `Top-Rated ${service} Services Offered by ${companyName}`,
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

function generateLocationPageTitle(service: string, location: string, companyName: string): string {
  const templates = [
    `${service} Services in ${location} | ${companyName}`,
    `Trusted ${service} Experts in ${location} - ${companyName}`,
    `Your ${location} ${service} Specialists | ${companyName}`,
    `Top ${service} Services in ${location} by ${companyName}`,
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

function generateBlogPostTitle(service: string, location: string): string {
  const templates = [
    `Top Tips for ${service} in ${location}`,
    `How to Choose the Best ${service} Services in ${location}`,
    `Essential Guide to ${service} for ${location} Homeowners`,
    `${service} Solutions: What ${location} Residents Need to Know`,
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

export const generateInitialContentItems = (
  data: BusinessInfo
): { items: ContentItem[]; total: number } => {
  const servicePages = data.services.length;
  const locationPages = data.services.length * data.locations.length;
  const blogPosts = locationPages;
  const total = servicePages + locationPages + blogPosts;

  const items: ContentItem[] = [
    // Service pages
    ...data.services.map(
      (service): ContentItem => ({
        title: generateServicePageTitle(service, data.companyName),
        type: "service",
        status: "pending",
        companies: { name: data.companyName },
      })
    ),
    // Location pages
    ...data.locations.flatMap((location) =>
      data.services.map(
        (service): ContentItem => ({
          title: generateLocationPageTitle(service, location, data.companyName),
          type: "location",
          status: "pending",
          companies: { name: data.companyName },
        })
      )
    ),
    // Blog posts
    ...data.locations.flatMap((location) =>
      data.services.map(
        (service): ContentItem => ({
          title: generateBlogPostTitle(service, location),
          type: "blog",
          status: "pending",
          companies: { name: data.companyName },
        })
      )
    ),
  ];

  return { items, total };
};
