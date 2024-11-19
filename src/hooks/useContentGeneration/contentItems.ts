import type { BusinessInfo, ContentItem } from "@/lib/types";

export const generateInitialContentItems = (data: BusinessInfo): { items: ContentItem[], total: number } => {
  const servicePages = data.services.length;
  const locationPages = data.services.length * data.locations.length;
  const blogPosts = locationPages;
  const total = servicePages + locationPages + blogPosts;

  const items: ContentItem[] = [
    // Service pages
    ...data.services.map((service): ContentItem => ({
      title: `${service} Services - ${data.companyName}`,
      type: "service",
      status: "pending",
      companies: { name: data.companyName }
    })),
    // Location pages
    ...data.locations.flatMap((location) =>
      data.services.map((service): ContentItem => ({
        title: `${service} Services in ${location} - ${data.companyName}`,
        type: "location",
        status: "pending",
        companies: { name: data.companyName }
      }))
    ),
    // Blog posts
    ...data.locations.flatMap((location) =>
      data.services.map((service): ContentItem => ({
        title: `Guide to ${service} Services in ${location}`,
        type: "blog",
        status: "pending",
        companies: { name: data.companyName }
      }))
    ),
  ];

  return { items, total };
};