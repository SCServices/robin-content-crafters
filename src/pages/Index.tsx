import { useState } from "react";
import Dashboard from "@/components/Dashboard";
import ContentOverview from "@/components/ContentOverview";
import Layout from "@/components/Layout";
import type { BusinessInfo, ContentItem, ContentStats } from "@/lib/types";
import ContentGenerationManager from "@/components/index/ContentGenerationManager";
import CompanySelector from "@/components/index/CompanySelector";
import ProcessSteps from "@/components/index/ProcessSteps";

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
            <div className="space-y-8 animate-fade-in delay-100">
              <ProcessSteps />
              <CompanySelector 
                selectedCompanyId={selectedCompanyId}
                onCompanySelect={setSelectedCompanyId}
              />
              <div className="max-w-md mx-auto">
                <ContentGenerationManager 
                  selectedCompanyId={selectedCompanyId}
                  onComplete={(data: BusinessInfo) => {
                    setIsOnboarding(false);
                  }}
                />
              </div>
            </div>
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