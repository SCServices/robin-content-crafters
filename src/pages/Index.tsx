import { useState } from "react";
import OnboardingForm from "@/components/OnboardingForm";
import Dashboard from "@/components/Dashboard";
import ContentOverview from "@/components/ContentOverview";
import type { BusinessInfo, ContentItem, ContentStats } from "@/lib/types";
import { toast } from "sonner";

const Index = () => {
  const [isOnboarding, setIsOnboarding] = useState(true);
  const [contentStats, setContentStats] = useState<ContentStats>({
    total: 0,
    generated: 0,
    pending: 0,
    error: 0,
  });
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);

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
    <div className="min-h-screen bg-neutral-50">
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
              Robin SEO Assistant
            </h1>
            <p className="text-neutral-600">
              Create optimized content for your business website
            </p>
          </div>

          {isOnboarding ? (
            <OnboardingForm onComplete={handleOnboardingComplete} />
          ) : (
            <div className="space-y-6">
              <Dashboard stats={contentStats} />
              <ContentOverview items={contentItems} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;