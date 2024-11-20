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
    
    if (result?.title) {
      return result.title;
    }
    
    // If no title was generated, fall back to templates
    return getDefaultTitle(type, data);
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