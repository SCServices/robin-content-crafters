import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import OnboardingForm from "@/components/OnboardingForm";
import Dashboard from "@/components/Dashboard";
import ContentOverview from "@/components/ContentOverview";
import Layout from "@/components/Layout";
import type { BusinessInfo, ContentItem, ContentStats } from "@/lib/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const Index = () => {
  const [isOnboarding, setIsOnboarding] = useState(true);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [contentStats, setContentStats] = useState<ContentStats>({
    total: 0,
    generated: 0,
    pending: 0,
    error: 0,
  });
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);

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

  const handleOnboardingComplete = (data: BusinessInfo) => {
    // Calculate total content items
    const servicePages = data.services.length;
    const locationPages = data.services.length * data.locations.length;
    const blogPosts = locationPages * 5;
    const total = servicePages + locationPages + blogPosts;

    // Initialize content items
    const items: ContentItem[] = [
      // Service pages
      ...data.services.map((service): ContentItem => ({
        title: `${service} Services - ${data.companyName}`,
        type: "service",
        status: "pending",
      })),
      // Location pages
      ...data.locations.flatMap((location) =>
        data.services.map((service): ContentItem => ({
          title: `${service} Services in ${location} - ${data.companyName}`,
          type: "location",
          status: "pending",
        }))
      ),
      // Blog posts (5 per location page)
      ...data.locations.flatMap((location) =>
        data.services.flatMap((service) =>
          Array.from({ length: 5 }, (_, i): ContentItem => ({
            title: `${i + 1}. Guide to ${service} Services in ${location}`,
            type: "blog",
            status: "pending",
          }))
        )
      ),
    ];

    setContentStats({
      total,
      generated: 0,
      pending: total,
      error: 0,
    });
    setContentItems(items);
    setIsOnboarding(false);

    // Simulate content generation
    simulateContentGeneration(items);
  };

  const simulateContentGeneration = (items: ContentItem[]) => {
    let generated = 0;
    let errors = 0;

    items.forEach((_, index) => {
      setTimeout(() => {
        setContentItems((prev) => {
          const newItems = [...prev];
          newItems[index] = {
            ...newItems[index],
            status: Math.random() > 0.1 ? "generated" : "error",
          };
          return newItems;
        });

        const success = Math.random() > 0.1;
        if (success) {
          generated++;
        } else {
          errors++;
        }

        setContentStats((prev) => ({
          ...prev,
          generated: generated,
          pending: prev.total - generated - errors,
          error: errors,
        }));

        if (index === items.length - 1) {
          toast.success("Content generation completed!");
        }
      }, index * 100); // Simulate generation time
    });
  };

  return (
    <Layout>
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
              Transform Your Business with SEO Automation
            </h1>
            <p className="text-neutral-600">
              Create optimized content for your business website that stands out and ranks #1 on Google.
            </p>
          </div>

          {isOnboarding ? (
            <>
              {companies && companies.length > 0 && (
                <div className="mb-8 p-4 bg-white rounded-lg shadow-sm">
                  <Label htmlFor="companySelect">Select an existing company to pre-fill information</Label>
                  <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Choose a company" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Our SEO SaaS tool helps you:</h2>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full" />
                    Generate optimized content for your service area and industry
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full" />
                    Create standout pages that rank high on search engines
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full" />
                    Automate your SEO strategy without any technical hassle
                  </li>
                </ul>
              </div>
              <OnboardingForm 
                onComplete={handleOnboardingComplete} 
                initialData={selectedCompany ? {
                  companyName: selectedCompany.name,
                  industry: selectedCompany.industry,
                  website: selectedCompany.website,
                  locations: [],
                  services: []
                } : undefined}
              />
            </>
          ) : (
            <div className="space-y-6">
              <Dashboard stats={contentStats} />
              <ContentOverview items={contentItems} />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Index;
