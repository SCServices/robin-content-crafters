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
    
    const progressToast = toast.loading('🚀 Phase 1/5: Setting up your business profile...', {
      duration: Infinity,
    });

    try {
      let companyData;
      
      // Company setup phase
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
      toast.loading('🗺️ Phase 2/5: Mapping your service areas...', { id: progressToast });

      // Services and locations setup
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
      toast.loading('✍️ Phase 3/5: Crafting engaging titles...', { id: progressToast });

      // Title generation phase
      const { data: contentData, error: titleError } = await supabase.functions.invoke("generate-titles", {
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

      if (contentData.contentEntries.length > 0) {
        const { error: contentError } = await supabase
          .from("generated_content")
          .insert(contentData.contentEntries);

        if (contentError) throw contentError;
      }

      setProgress(60);
      toast.loading('📝 Phase 4/5: Creating your content...', { id: progressToast });

      // Content generation phase
      const totalItems = contentData.contentEntries.length;
      let completedItems = 0;

      for (const entry of contentData.contentEntries) {
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
        const newProgress = 60 + (completedItems / totalItems) * 35;
        setProgress(newProgress);
        
        // Show detailed progress during content creation
        toast.loading(`📝 Phase 4/5: Creating content (${completedItems}/${totalItems} pieces)...`, { id: progressToast });
      }

      // Final phase
      setProgress(95);
      toast.loading('🎨 Phase 5/5: Applying final touches...', { id: progressToast });
      await new Promise(resolve => setTimeout(resolve, 1000)); // Brief pause for user to see final phase

      setProgress(100);
      toast.success('✨ All done! Your content is ready to explore', { id: progressToast });
      return { success: true };
    } catch (error) {
      console.error("Error:", error);
      toast.error('❌ Something went wrong during content generation', { id: progressToast });
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