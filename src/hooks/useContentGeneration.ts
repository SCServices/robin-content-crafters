import { useState, useEffect } from "react";
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

      // Create content entries for services, locations, and blog posts
      const contentEntries = [];

      // Service pages
      for (const service of servicesData || []) {
        contentEntries.push({
          company_id: companyData.id,
          service_id: service.id,
          title: `${service.name} Services - ${businessInfo.companyName}`,
          type: "service",
        });
      }

      // Location pages and blog posts
      for (const service of servicesData || []) {
        for (const location of locationsData || []) {
          // Location page
          contentEntries.push({
            company_id: companyData.id,
            service_id: service.id,
            location_id: location.id,
            title: `${service.name} Services in ${location.location} - ${businessInfo.companyName}`,
            type: "location",
          });

          // Blog posts
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
      toast.loading('Starting AI content generation...', { id: progressToast });

      // Generate content for each entry
      for (const service of servicesData || []) {
        const companyInfo = {
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
          },
        });

        // Generate location pages and blog posts
        for (const location of locationsData || []) {
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

  // Subscribe to content generation progress
  useEffect(() => {
    const subscription = supabase
      .channel('generated_content_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'generated_content',
        },
        (payload) => {
          if (payload.new.status === 'generated') {
            // Update progress when content is generated
            setProgress((prev) => {
              const newProgress = prev + 1;
              return Math.min(newProgress, 100);
            });
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    createCompanyAndContent,
    isGenerating,
    progress,
  };
};