import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { BusinessInfo } from "@/lib/types";
import { createContentEntries } from "@/lib/contentGeneration/contentEntries";
import { calculateTotalItems, updateProgress } from "@/lib/contentGeneration/progressUtils";
import type { ContentGenerationProgress, ContentGenerationResult, CompanyInfo } from "@/lib/contentGeneration/types";

export const useContentGeneration = (): ContentGenerationProgress & {
  createCompanyAndContent: (businessInfo: BusinessInfo) => Promise<ContentGenerationResult>;
} => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const createCompanyAndContent = async (businessInfo: BusinessInfo) => {
    setIsGenerating(true);
    setProgress(0);
    
    const progressToast = toast.loading('Starting content generation process...', {
      duration: 3000, // Set duration to 3 seconds
    });

    try {
      // Check existing company
      toast.loading('Checking existing company data...', { 
        id: progressToast,
        duration: 3000
      });

      const { data: existingCompany } = await supabase
        .from("companies")
        .select("*")
        .eq("name", businessInfo.companyName)
        .limit(1);

      // Handle company creation/update
      let companyData;
      if (existingCompany && existingCompany.length > 0) {
        toast.loading('Updating existing company information...', { 
          id: progressToast,
          duration: 3000
        });
        const { data: updatedCompany, error: updateError } = await supabase
          .from("companies")
          .update({
            industry: businessInfo.industry,
            website: businessInfo.website,
          })
          .eq("id", existingCompany[0].id)
          .select()
          .single();

        if (updateError) throw updateError;
        companyData = updatedCompany;

        // Delete existing data
        await supabase.from("services").delete().eq("company_id", companyData.id);
        await supabase.from("service_locations").delete().eq("company_id", companyData.id);
      } else {
        toast.loading('Creating new company profile...', { 
          id: progressToast,
          duration: 3000
        });
        const { data: newCompany, error: companyError } = await supabase
          .from("companies")
          .insert({
            name: businessInfo.companyName,
            industry: businessInfo.industry,
            website: businessInfo.website,
          })
          .select()
          .single();

        if (companyError) throw companyError;
        companyData = newCompany;
      }

      setProgress(20);

      // Insert services and locations
      toast.loading('Setting up service information...', { 
        id: progressToast,
        duration: 3000
      });
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

      setProgress(40);
      toast.loading('Adding location data...', { 
        id: progressToast,
        duration: 3000
      });
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

      setProgress(60);
      toast.loading('Preparing content structure...', { 
        id: progressToast,
        duration: 3000
      });
      
      // Create content entries including 5 blog posts per service/location
      const contentEntries = createContentEntries(companyData.id, servicesData, locationsData);

      setProgress(80);
      // Insert all content entries
      if (contentEntries.length > 0) {
        const { error: contentError } = await supabase
          .from("generated_content")
          .insert(contentEntries);

        if (contentError) throw contentError;
      }

      // Start content generation process
      toast.loading('Starting AI content generation...', { 
        id: progressToast,
        duration: 3000
      });
      const totalItems = calculateTotalItems(servicesData.length, locationsData.length);
      let completedItems = 0;

      // Generate content for each entry
      for (const service of servicesData) {
        if (!service?.id) continue;
        const companyInfo: CompanyInfo = {
          companyName: businessInfo.companyName,
          industry: businessInfo.industry,
          serviceName: service.name,
          companyId: companyData.id,
        };

        // Generate service page
        await supabase.functions.invoke("generate-content", {
          body: {
            contentType: "service",
            companyInfo,
            serviceId: service.id,
            model: "gpt-4o mini"
          },
        });
        completedItems++;
        updateProgress(completedItems, totalItems, setProgress, progressToast.toString());

        // Generate location pages and blog posts
        for (const location of locationsData) {
          if (!location?.id) continue;
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
              model: "gpt-4o mini"
            },
          });
          completedItems++;
          updateProgress(completedItems, totalItems, setProgress, progressToast.toString());

          // Generate 5 blog posts
          for (let i = 0; i < 5; i++) {
            await supabase.functions.invoke("generate-content", {
              body: {
                contentType: "blog",
                companyInfo: locationInfo,
                serviceId: service.id,
                locationId: location.id,
                model: "gpt-4o mini"
              },
            });
            completedItems++;
            updateProgress(completedItems, totalItems, setProgress, progressToast.toString());
          }
        }
      }

      toast.success('Content generation completed successfully!', { 
        id: progressToast,
        duration: 3000
      });
      return { success: true };
    } catch (error) {
      console.error("Error:", error);
      toast.error('An error occurred while processing your information', { 
        id: progressToast,
        duration: 3000
      });
      return { success: false, error };
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  return {
    createCompanyAndContent,
    isGenerating,
    progress,
  };
};