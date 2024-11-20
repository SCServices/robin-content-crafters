import { supabase } from "@/integrations/supabase/client";

export const serviceTitleTemplates = [
  `Get Reliable {service} Services Today`,
  `Your Trusted Source for {service}`,
  `Affordable {service} Solutions Near You`,
  `Expert Help with {service}`,
  `Top Choice for {service} Needs`,
  `Professional {service} Services You Can Trust`,
  `Quality {service} at Great Prices`,
  `Experienced {service} Specialists Ready to Help`,
  `Quick and Easy {service} Solutions`,
  `Dependable {service} Services for Your Home`
];

export const locationTitleTemplates = [
  `Expert {service} Services in {location}`,
  `Your Go-To {service} Experts in {location}`,
  `Need {service} in {location}? We've Got You Covered`,
  `Fast and Reliable {service} Services in {location}`,
  `Top-Rated {service} Solutions in {location}`,
  `Trusted {service} Professionals Serving {location}`,
  `Quality {service} Services in {location}`,
  `Dependable {service} Help in {location} When You Need It`,
  `Experienced {service} Specialists in {location}`,
  `Your Local {service} Experts in {location}`
];

export const blogTitleTemplates = [
  `10 Essential Tips for {service} in {location}`,
  `7 Reasons to Choose Professional {service} Services in {location}`,
  `5 Common {service} Mistakes and How to Avoid Them`,
  `How to Get the Best {service} in {location}`,
  `A Step-by-Step Guide to {service} for {location} Homeowners`,
  `How to Save Money on {service} Services in {location}`,
  `{service} Options in {location}: DIY vs. Professional Services`,
  `Comparing Top {service} Providers in {location}`,
  `Case Study: Successful {service} Projects in {location}`,
  `Real-Life Examples of {service} Solutions in {location}`
];

export const generateTitle = async (type: "service" | "location" | "blog", data: {
  companyName: string;
  industry: string;
  service: string;
  location?: string;
}) => {
  try {
    const { data: result } = await supabase.functions.invoke("generate-content", {
      body: {
        contentType: type,
        titleOnly: true,
        companyInfo: {
          companyName: data.companyName,
          industry: data.industry,
          serviceName: data.service,
          location: data.location,
        },
      },
    });
    return result?.title || getDefaultTitle(type, data);
  } catch (error) {
    console.error("Error generating title:", error);
    return getDefaultTitle(type, data);
  }
};

export const getDefaultTitle = (type: "service" | "location" | "blog", data: {
  companyName: string;
  service: string;
  location?: string;
}) => {
  const templates = {
    service: serviceTitleTemplates,
    location: locationTitleTemplates,
    blog: blogTitleTemplates
  };

  const template = templates[type][Math.floor(Math.random() * templates[type].length)];
  const replacements = {
    service: data.service,
    location: data.location || "",
    companyName: data.companyName
  };

  return Object.entries(replacements).reduce(
    (str, [key, value]) => str.replace(new RegExp(`{${key}}`, 'g'), value),
    template
  );
};