import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { BusinessInfo } from "@/lib/types";

export const useContentGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const createCompanyAndContent = async (businessInfo: BusinessInfo) => {
    setIsGenerating(true);
    try {
      // Insert company
      const { data: companyData, error: companyError } = await supabase
        .from("companies")
        .insert({
          name: businessInfo.companyName,
          industry: businessInfo.industry,
          website: businessInfo.website,
        })
        .select()
        .single();

      if (companyError) throw companyError;

      // Insert services
      const { data: servicesData, error: servicesError } = await supabase
        .from("services")
        .insert(
          businessInfo.services.map((service) => ({
            company_id: companyData.id,
            name: service,
          }))
        )
        .select();

      if (servicesError) throw servicesError;

      // Insert locations
      const { data: locationsData, error: locationsError } = await supabase
        .from("service_locations")
        .insert(
          businessInfo.locations.map((location) => ({
            company_id: companyData.id,
            location: location,
          }))
        )
        .select();

      if (locationsError) throw locationsError;

      // Create content entries for each combination
      const contentEntries = [];

      // Service pages
      for (const service of servicesData) {
        contentEntries.push({
          company_id: companyData.id,
          service_id: service.id,
          title: `${service.name} Services - ${businessInfo.companyName}`,
          type: "service",
        });
      }

      // Location pages and blog posts
      for (const service of servicesData) {
        for (const location of locationsData) {
          contentEntries.push({
            company_id: companyData.id,
            service_id: service.id,
            location_id: location.id,
            title: `${service.name} Services in ${location.location} - ${businessInfo.companyName}`,
            type: "location",
          });

          // Blog posts for each location page
          for (let i = 1; i <= 5; i++) {
            contentEntries.push({
              company_id: companyData.id,
              service_id: service.id,
              location_id: location.id,
              title: `${i}. Guide to ${service.name} Services in ${location.location}`,
              type: "blog",
            });
          }
        }
      }

      // Insert all content entries
      const { error: contentError } = await supabase
        .from("generated_content")
        .insert(contentEntries);

      if (contentError) throw contentError;

      // Start content generation process
      for (const service of servicesData) {
        const companyInfo = {
          companyName: businessInfo.companyName,
          industry: businessInfo.industry,
          serviceName: service.name,
        };

        // Generate service page
        await supabase.functions.invoke("generate-content", {
          body: {
            contentType: "service",
            companyInfo,
            serviceId: service.id,
          },
        });

        // Generate location pages and blog posts
        for (const location of locationsData) {
          const locationInfo = {
            ...companyInfo,
            location: location.location,
          };

          // Generate location page
          await supabase.functions.invoke("generate-content", {
            body: {
              contentType: "location",
              companyInfo: locationInfo,
              serviceId: service.id,
              locationId: location.id,
            },
          });

          // Generate blog posts
          for (let i = 0; i < 5; i++) {
            await supabase.functions.invoke("generate-content", {
              body: {
                contentType: "blog",
                companyInfo: locationInfo,
                serviceId: service.id,
                locationId: location.id,
              },
            });
          }
        }
      }

      toast.success("Information submitted and content generation started!");
      return { success: true };
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred while processing your information");
      return { success: false, error };
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    createCompanyAndContent,
    isGenerating,
  };
};