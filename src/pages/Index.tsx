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

  const handleContentGeneration = async (items: ContentItem[]) => {
    setContentItems(items);
    
    // Query the generated content from the database
    const { data: generatedContent } = await supabase
      .from("generated_content")
      .select(`
        id,
        title,
        content,
        type,
        status,
        companies:company_id (
          name
        )
      `)
      .order('created_at', { ascending: false });

    if (generatedContent) {
      setContentItems(generatedContent.map(item => ({
        title: item.title,
        type: item.type,
        status: item.status,
        content: item.content,
        company: item.companies
      })));
    }

    // Simulate content generation progress
    let generated = 0;
    const interval = setInterval(async () => {
      if (generated < items.length) {
        // Query latest content status
        const { data: latestContent } = await supabase
          .from("generated_content")
          .select(`
            id,
            title,
            content,
            type,
            status,
            companies:company_id (
              name
            )
          `)
          .order('created_at', { ascending: false });

        if (latestContent) {
          setContentItems(latestContent.map(item => ({
            title: item.title,
            type: item.type,
            status: item.status,
            content: item.content,
            company: item.companies
          })));
        }

        const generatedCount = latestContent?.filter(item => item.status === 'generated').length || 0;
        setContentStats(prev => ({
          ...prev,
          generated: generatedCount,
          pending: items.length - generatedCount,
        }));
        generated++;
      } else {
        clearInterval(interval);
      }
    }, 2000); // Check every 2 seconds
  };

  return (
    <Layout>
      <div className="container py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center animate-fade-in">
            <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary via-primary-dark to-primary bg-clip-text text-transparent">
              Transform Your Business with SEO Automation
            </h1>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
              Create optimized content for your business website that stands out and ranks #1 on Google.
              Our AI-powered platform helps you generate high-quality, SEO-optimized content at scale.
            </p>
          </div>

          {isOnboarding ? (
            <>
              <div className="space-y-8 animate-fade-in delay-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div className="p-6 bg-white/50 backdrop-blur-sm rounded-xl shadow-sm border border-neutral-100">
                    <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-primary font-semibold">1</span>
                    </div>
                    <h3 className="font-semibold mb-2 text-neutral-800">Generate Content</h3>
                    <p className="text-sm text-neutral-600">
                      Automatically create optimized content for your service areas
                    </p>
                  </div>
                  <div className="p-6 bg-white/50 backdrop-blur-sm rounded-xl shadow-sm border border-neutral-100">
                    <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-primary font-semibold">2</span>
                    </div>
                    <h3 className="font-semibold mb-2 text-neutral-800">Rank Higher</h3>
                    <p className="text-sm text-neutral-600">
                      Create standout pages that rank high on search engines
                    </p>
                  </div>
                  <div className="p-6 bg-white/50 backdrop-blur-sm rounded-xl shadow-sm border border-neutral-100">
                    <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-primary font-semibold">3</span>
                    </div>
                    <h3 className="font-semibold mb-2 text-neutral-800">Automate SEO</h3>
                    <p className="text-sm text-neutral-600">
                      Streamline your SEO strategy without technical hassle
                    </p>
                  </div>
                </div>

                {companies && companies.length > 0 && (
                  <div className="p-6 bg-white rounded-xl shadow-sm border border-neutral-100 max-w-md mx-auto">
                    <Label htmlFor="companySelect" className="block text-sm font-medium text-neutral-700 mb-2">
                      Select an existing company to pre-fill information
                    </Label>
                    <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                      <SelectTrigger id="companySelect" className="w-full bg-white">
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

                <div className="max-w-md mx-auto">
                  <OnboardingForm 
                    onComplete={(data: BusinessInfo) => {
                      // Calculate total content items
                      const servicePages = data.services.length;
                      const locationPages = data.services.length * data.locations.length;
                      const blogPosts = locationPages * 5;
                      const total = servicePages + locationPages + blogPosts;

                      // Initialize content items
                      const items: ContentItem[] = [
                        // Service pages
                        ...data.services.map((service): ContentItem => ({
                          title: "",
                          type: "service",
                          status: "pending",
                        })),
                        // Location pages
                        ...data.locations.flatMap((location) =>
                          data.services.map((service): ContentItem => ({
                            title: "",
                            type: "location",
                            status: "pending",
                          }))
                        ),
                        // Blog posts (5 per location page)
                        ...data.locations.flatMap((location) =>
                          data.services.flatMap((service) =>
                            Array.from({ length: 5 }, (_, i): ContentItem => ({
                              title: "",
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

                      // Start content generation simulation
                      handleContentGeneration(items);
                    }}
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
            </>
          ) : (
            <div className="space-y-6 animate-fade-in">
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