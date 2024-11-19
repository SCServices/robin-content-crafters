import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { BusinessInfo } from "@/lib/types";

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

      // Insert services and locations
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

      // Generate all titles using the Edge Function
      const { data: titleData, error: titleError } = await supabase.functions.invoke("generate-titles", {
        body: {
          services: servicesData,
          locations: locationsData,
          companyInfo: {
            companyName: businessInfo.companyName,
            industry: businessInfo.industry,
            companyId: companyData.id,
          },
        },
      });

      if (titleError) throw titleError;
      const contentEntries = titleData.contentEntries;

      // Insert content entries
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