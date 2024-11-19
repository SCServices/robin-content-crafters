import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import OnboardingForm from "@/components/OnboardingForm";
import { supabase } from "@/integrations/supabase/client";
import type { BusinessInfo, ContentItem } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ContentGenerationManagerProps {
  onComplete: (data: BusinessInfo) => void;
  selectedCompanyId: string;
}

const ContentGenerationManager = ({ onComplete, selectedCompanyId }: ContentGenerationManagerProps) => {
  const { data: companies } = useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const selectedCompany = companies?.find(company => company.id === selectedCompanyId);

  const handleContentGeneration = async (items: ContentItem[]) => {
    const { data: generatedContent } = await supabase
      .from("generated_content")
      .select(`
        id,
        title,
        content,
        type,
        status,
        companies (
          name
        )
      `)
      .order('created_at', { ascending: false });

    if (generatedContent) {
      return generatedContent.map(item => ({
        title: item.title,
        type: item.type,
        status: item.status,
        content: item.content,
        company: item.companies
      }));
    }
    return [];
  };

  return (
    <OnboardingForm 
      onComplete={async (data: BusinessInfo) => {
        const servicePages = data.services.length;
        const locationPages = data.services.length * data.locations.length;
        const blogPosts = locationPages * 5;
        const total = servicePages + locationPages + blogPosts;

        const items: ContentItem[] = [];

        data.services.forEach(service => {
          items.push({
            title: "",
            type: "service",
            status: "pending",
            company: { name: data.companyName }
          });
        });

        data.locations.forEach(location => {
          data.services.forEach(service => {
            items.push({
              title: "",
              type: "location",
              status: "pending",
              company: { name: data.companyName }
            });

            for (let i = 0; i < 5; i++) {
              items.push({
                title: "",
                type: "blog",
                status: "pending",
                company: { name: data.companyName }
              });
            }
          });
        });

        onComplete(data);

        const monitorContent = async () => {
          const contentItems = await handleContentGeneration(items);
          const generatedCount = contentItems.filter(item => item.status === 'generated').length;
          
          if (generatedCount < total) {
            setTimeout(monitorContent, 2000);
          }
        };

        monitorContent();
      }}
      initialData={selectedCompany ? {
        companyName: selectedCompany.name,
        industry: selectedCompany.industry,
        website: selectedCompany.website,
        locations: [],
        services: []
      } : undefined}
    />
  );
};

export default ContentGenerationManager;