import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { BusinessInfo, ContentItem } from "@/lib/types";
import { useContentState } from "./useContentGeneration/contentState";
import { useContentSubscription } from "./useContentGeneration/supabaseSubscription";
import { generateInitialContentItems } from "./useContentGeneration/contentItems";

export const useContentGeneration = () => {
  const {
    contentItems,
    setContentItems,
    contentStats,
    updateContentStats,
    isGenerating,
    setIsGenerating,
    progress,
    setProgress,
  } = useContentState();

  // Get the setupSubscription function
  const setupSubscription = useContentSubscription(
    contentItems[0]?.companies?.id || null,
    (updatedItems) => {
      setContentItems(updatedItems);
      updateContentStats(updatedItems);
    }
  );

  // Call setupSubscription when contentItems changes
  useEffect(() => {
    if (contentItems[0]?.companies?.id) {
      const cleanup = setupSubscription();
      return () => {
        if (cleanup) cleanup();
      };
    }
  }, [contentItems[0]?.companies?.id]);

  const generateTitle = async (
    type: string,
    info: { companyName: string; industry: string; serviceName: string },
    location?: string
  ) => {
    try {
      const { data } = await supabase.functions.invoke("generate-titles", {
        body: { contentType: type, companyInfo: info, location },
      });
      return data?.title || generateFallbackTitle(type, info, location);
    } catch (error) {
      console.error("Error generating title:", error);
      return generateFallbackTitle(type, info, location);
    }
  };

  const createCompanyAndContent = async (businessInfo: BusinessInfo) => {
    setIsGenerating(true);
    setProgress(0);

    const { items, total } = generateInitialContentItems(businessInfo);
    setContentItems(items);
    updateContentStats(items);

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
      for (const service of servicesData) {
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
      for (const service of servicesData) {
        if (!service?.id) continue;
        for (const location of locationsData) {
          if (!location?.id) continue;

          const locationTitle = await generateTitle(
            "location",
            {
              companyName: businessInfo.companyName,
              industry: businessInfo.industry,
              serviceName: service.name,
            },
            location.location
          );

          contentEntries.push({
            company_id: companyData.id,
            service_id: service.id,
            location_id: location.id,
            title: locationTitle,
            type: "location",
          });

          // Blog posts for each location page
          const blogTitle = await generateTitle(
            "blog",
            {
              companyName: businessInfo.companyName,
              industry: businessInfo.industry,
              serviceName: service.name,
            },
            location.location
          );

          contentEntries.push({
            company_id: companyData.id,
            service_id: service.id,
            location_id: location.id,
            title: blogTitle,
            type: "blog",
          });
        }
      }

      // Insert all content entries
      if (contentEntries.length > 0) {
        const { error: contentError } = await supabase
          .from("generated_content")
          .insert(contentEntries);

        if (contentError) throw contentError;
      }

      // Start content generation process
      toast.loading('Starting AI content generation...', { id: progressToast });
      const totalItems = servicesData.length * (1 + locationsData.length * 2); // Services + (Locations + Blogs) per service
      let completedItems = 0;

      for (const service of servicesData) {
        if (!service?.id) continue;
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
        completedItems++;
        setProgress(80 + (completedItems / totalItems) * 20);
        toast.loading(`Generating content: ${Math.round((completedItems / totalItems) * 100)}% complete...`, { id: progressToast });

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
            },
          });
          completedItems++;
          setProgress(80 + (completedItems / totalItems) * 20);
          toast.loading(`Generating content: ${Math.round((completedItems / totalItems) * 100)}% complete...`, { id: progressToast });

          // Generate blog posts
          await supabase.functions.invoke("generate-content", {
            body: {
              contentType: "blog",
              companyInfo: locationInfo,
              serviceId: service.id,
              locationId: location.id,
            },
          });
          completedItems++;
          setProgress(80 + (completedItems / totalItems) * 20);
          toast.loading(`Generating content: ${Math.round((completedItems / totalItems) * 100)}% complete...`, { id: progressToast });
        }
      }

      toast.success('Content generation completed successfully!', { id: progressToast });
      return { success: true, items };
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
    contentItems,
    contentStats,
  };
};
