import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import OnboardingForm from "@/components/OnboardingForm";
import Dashboard from "@/components/Dashboard";
import ContentOverview from "@/components/ContentOverview";
import Layout from "@/components/Layout";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import CompanySelector from "@/components/CompanySelector";
import type { BusinessInfo, ContentStats } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import { getRandomTemplate, serviceTitleTemplates, locationTitleTemplates, blogTitleTemplates } from "@/lib/titleTemplates";

const Index = () => {
  const [isOnboarding, setIsOnboarding] = useState(true);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [contentStats, setContentStats] = useState<ContentStats>({
    total: 0,
    generated: 0,
    pending: 0,
    error: 0,
  });

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

  const handleContentGeneration = (total: number) => {
    setContentStats({
      total,
      generated: 0,
      pending: total,
      error: 0,
    });
    setIsOnboarding(false);

    // Simulate content generation progress
    let generated = 0;
    const interval = setInterval(() => {
      if (generated < total) {
        generated++;
        setContentStats(prev => ({
          ...prev,
          generated: generated,
          pending: prev.total - generated,
        }));
      } else {
        clearInterval(interval);
      }
    }, 1000);
  };

  const handleFormComplete = (data: BusinessInfo) => {
    // Calculate total content items
    const servicePages = data.services.length;
    const locationPages = data.services.length * data.locations.length;
    const blogPosts = locationPages * 5;
    const total = servicePages + locationPages + blogPosts;

    handleContentGeneration(total);
  };

  return (
    <Layout>
      <div className="container py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-12">
          <Hero />

          {isOnboarding ? (
            <div className="space-y-8 animate-fade-in delay-100">
              <Features />
              <CompanySelector 
                companies={companies || []}
                selectedCompanyId={selectedCompanyId}
                onCompanySelect={setSelectedCompanyId}
              />
              <div className="max-w-md mx-auto">
                <OnboardingForm 
                  onComplete={handleFormComplete}
                  initialData={selectedCompany ? {
                    companyName: selectedCompany.name,
                    industry: selectedCompany.industry,
                    website: selectedCompany.website,
                    locations: [],
                    services: []
                  } : undefined}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in">
              <Dashboard stats={contentStats} />
              <ContentOverview />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Index;