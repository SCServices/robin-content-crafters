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
      
      toast.loading('Checking existing company data...', { id: progressToast });
      // Check if company already exists by name
      const { data: existingCompany } = await supabase
        .from("companies")
        .select("*")
        .eq("name", businessInfo.companyName)
        .limit(1);

      if (existingCompany && existingCompany.length > 0) {
        toast.loading('Updating existing company information...', { id: progressToast });
        // Update existing company
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

        // Delete existing services and locations
        await supabase.from("services").delete().eq("company_id", companyData.id);
        await supabase.from("service_locations").delete().eq("company_id", companyData.id);
      } else {
        toast.loading('Creating new company profile...', { id: progressToast });
        // Insert new company
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
      toast.loading('Setting up service information...', { id: progressToast });
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

      setProgress(40);
      toast.loading('Adding location data...', { id: progressToast });
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

      setProgress(60);
      toast.loading('Preparing content structure...', { id: progressToast });

      // Create content entries for each combination
      const contentEntries = [];

      // Service pages
      for (const service of servicesData || []) {
        if (!service?.id) continue;
        contentEntries.push({
          company_id: companyData.id,
          service_id: service.id,
          title: `${service.name} Services by ${businessInfo.companyName}`,
          type: "service",
        });
      }

      // Location pages and blog posts
      for (const service of servicesData || []) {
        if (!service?.id) continue;
        for (const location of locationsData || []) {
          if (!location?.id) continue;

          contentEntries.push({
            company_id: companyData.id,
            service_id: service.id,
            location_id: location.id,
            title: `${service.name} Services in ${location.location}`,
            type: "location",
          });

          contentEntries.push({
            company_id: companyData.id,
            service_id: service.id,
            location_id: location.id,
            title: `Guide to ${service.name} in ${location.location}`,
            type: "blog",
          });
        }
      }

      setProgress(80);
      // Insert all content entries
      if (contentEntries.length > 0) {
        const { data: insertedContent, error: contentError } = await supabase
          .from("generated_content")
          .insert(contentEntries)
          .select();

        if (contentError) throw contentError;

        // Start content generation process
        toast.loading('Starting AI content generation...', { id: progressToast });
        const totalItems = insertedContent.length;
        let completedItems = 0;

        for (const content of insertedContent) {
          const companyInfo = {
            companyName: businessInfo.companyName,
            industry: businessInfo.industry,
            serviceName: servicesData?.find(s => s.id === content.service_id)?.name || '',
            location: locationsData?.find(l => l.id === content.location_id)?.location || '',
            companyId: companyData.id,
            contentId: content.id // Add this line to pass the content ID
          };

          try {
            const { data: functionResponse } = await supabase.functions.invoke("generate-content", {
              body: {
                contentType: content.type,
                companyInfo,
                serviceId: content.service_id,
                locationId: content.location_id,
              },
            });

            completedItems++;
            setProgress(80 + (completedItems / totalItems) * 20);
            toast.loading(`Generating content: ${Math.round((completedItems / totalItems) * 100)}% complete...`, { id: progressToast });
          } catch (error) {
            console.error("Error generating content:", error);
            // Update status to error for this content
            await supabase
              .from("generated_content")
              .update({
                status: "error",
              })
              .eq("id", content.id);
          }
        }
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