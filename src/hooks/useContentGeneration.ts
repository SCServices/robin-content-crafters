import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { BusinessInfo } from "@/lib/types";
import { generateTitle } from "./useContentGeneration/titleGeneration";

export const useContentGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const createCompanyAndContent = async (businessInfo: BusinessInfo) => {
    setIsGenerating(true);
    setProgress(0);
    
    const progressToast = toast.loading('Starting content generation process...', {
      duration: Infinity,
    });

    try {
      let companyData;
      
      // Check if company exists and create/update it
      toast.loading('Checking existing company data...', { id: progressToast });
      const { data: existingCompany } = await supabase
        .from("companies")
        .select("*")
        .eq("name", businessInfo.companyName)
        .limit(1);

      if (existingCompany && existingCompany.length > 0) {
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

        await supabase.from("services").delete().eq("company_id", companyData.id);
        await supabase.from("service_locations").delete().eq("company_id", companyData.id);
      } else {
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

      const { data: servicesData } = await supabase
        .from("services")
        .insert(
          businessInfo.services.map((service) => ({
            company_id: companyData.id,
            name: service,
          }))
        )
        .select();

      const { data: locationsData } = await supabase
        .from("service_locations")
        .insert(
          businessInfo.locations.map((location) => ({
            company_id: companyData.id,
            location: location,
          }))
        )
        .select();

      setProgress(40);

      // Generate content entries with AI-generated titles
      const contentEntries = [];

      // Service pages
      for (const service of servicesData || []) {
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

      // Location pages and blog posts
      for (const service of servicesData || []) {
        if (!service?.id) continue;
        for (const location of locationsData || []) {
          if (!location?.id) continue;
          
          const locationTitle = await generateTitle("location", {
            companyName: businessInfo.companyName,
            industry: businessInfo.industry,
            serviceName: service.name,
          }, location.location);

          contentEntries.push({
            company_id: companyData.id,
            service_id: service.id,
            location_id: location.id,
            title: locationTitle,
            type: "location",
          });

          const blogTitle = await generateTitle("blog", {
            companyName: businessInfo.companyName,
            industry: businessInfo.industry,
            serviceName: service.name,
          }, location.location);

          contentEntries.push({
            company_id: companyData.id,
            service_id: service.id,
            location_id: location.id,
            title: blogTitle,
            type: "blog",
          });
        }
      }

      if (contentEntries.length > 0) {
        const { error: contentError } = await supabase
          .from("generated_content")
          .insert(contentEntries);

        if (contentError) throw contentError;
      }

      setProgress(60);

      // Generate content using the Edge Function
      const totalItems = contentEntries.length;
      let completedItems = 0;

      for (const entry of contentEntries) {
        await supabase.functions.invoke("generate-content", {
          body: {
            contentType: entry.type,
            companyInfo: {
              companyName: businessInfo.companyName,
              industry: businessInfo.industry,
              serviceName: servicesData?.find(s => s.id === entry.service_id)?.name,
              companyId: companyData.id,
            },
            serviceId: entry.service_id,
            locationId: entry.location_id,
          },
        });

        completedItems++;
        const newProgress = 60 + (completedItems / totalItems) * 40;
        setProgress(newProgress);
        toast.loading(`Generating content: ${Math.round(newProgress)}% complete...`, { id: progressToast });
      }

      toast.success('Content generation completed successfully!', { id: progressToast });
      return { success: true };
    } catch (error) {
      console.error("Error:", error);
      toast.error('An error occurred while processing your information', { id: progressToast });
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
