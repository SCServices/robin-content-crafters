import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { BusinessInfo } from "@/lib/types";
import { createContentEntries } from "./titleGeneration";
import { handleCompanyCreation } from "./companyManagement";
import { generateContent } from "./contentGeneration";
import type { ContentEntry } from "./types";

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
      // Handle company creation/update
      const { companyData, servicesData, locationsData } = await handleCompanyCreation(businessInfo);
      setProgress(40);

      // Generate titles and create content entries
      toast.loading('Generating optimized titles...', { id: progressToast });
      const contentEntries = await createContentEntries(
        companyData,
        servicesData || [],
        locationsData || [],
        businessInfo
      );

      // Insert content entries
      if (contentEntries.length > 0) {
        const { error: contentError } = await supabase
          .from("generated_content")
          .insert(contentEntries);

        if (contentError) throw contentError;
      }

      setProgress(60);

      // Generate content using Edge Function
      await generateContent(
        contentEntries,
        businessInfo,
        servicesData,
        companyData,
        (progress) => {
          const newProgress = 60 + progress * 40;
          setProgress(newProgress);
          toast.loading(`Generating content: ${Math.round(newProgress)}% complete...`, { id: progressToast });
        }
      );

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