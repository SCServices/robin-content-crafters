import { useState } from "react";
import BusinessInfoStep from "./BusinessInfoStep";
import LocationsStep from "./LocationsStep";
import ServicesStep from "./ServicesStep";
import type { BusinessInfo } from "@/lib/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface OnboardingFormProps {
  onComplete: (data: BusinessInfo) => void;
}

const OnboardingForm = ({ onComplete }: OnboardingFormProps) => {
  const [step, setStep] = useState(1);
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [website, setWebsite] = useState("");
  const [locations, setLocations] = useState<string[]>([]);
  const [services, setServices] = useState<string[]>([]);

  const createCompanyAndContent = async (businessInfo: BusinessInfo) => {
    try {
      // Insert company
      const { data: companyData, error: companyError } = await supabase
        .from("companies")
        .insert({
          name: businessInfo.companyName,
          industry: businessInfo.industry,
          website: businessInfo.website,
        })
        .select()
        .single();

      if (companyError) throw companyError;

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

      // Create content entries for each combination
      const contentEntries = [];

      // Service pages
      for (const service of servicesData) {
        contentEntries.push({
          company_id: companyData.id,
          service_id: service.id,
          title: `${service.name} Services - ${businessInfo.companyName}`,
          type: "service",
        });
      }

      // Location pages
      for (const service of servicesData) {
        for (const location of locationsData) {
          const locationPage = {
            company_id: companyData.id,
            service_id: service.id,
            location_id: location.id,
            title: `${service.name} Services in ${location.location} - ${businessInfo.companyName}`,
            type: "location",
          };
          contentEntries.push(locationPage);

          // Blog posts for each location page
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
      for (const service of servicesData) {
        const companyInfo = {
          companyName: businessInfo.companyName,
          industry: businessInfo.industry,
          serviceName: service.name,
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
        for (const location of locationsData) {
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
          for (let i = 0; i < 5; i++) {
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
      }

      toast.success("Information submitted and content generation started!");
      onComplete(businessInfo);
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred while processing your information");
    }
  };

  const handleSubmit = () => {
    const businessInfo: BusinessInfo = {
      companyName,
      industry,
      website,
      locations,
      services,
    };
    
    createCompanyAndContent(businessInfo);
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {[1, 2, 3].map((number) => (
            <div
              key={number}
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= number
                  ? "bg-primary text-white"
                  : "bg-neutral-100 text-neutral-400"
              }`}
            >
              {number}
            </div>
          ))}
        </div>
        <div className="h-2 bg-neutral-100 rounded-full">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${((step - 1) / 2) * 100}%` }}
          />
        </div>
      </div>

      {step === 1 && (
        <BusinessInfoStep
          companyName={companyName}
          setCompanyName={setCompanyName}
          industry={industry}
          setIndustry={setIndustry}
          website={website}
          setWebsite={setWebsite}
          onNext={() => setStep(2)}
        />
      )}

      {step === 2 && (
        <LocationsStep
          locations={locations}
          setLocations={setLocations}
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}

      {step === 3 && (
        <ServicesStep
          services={services}
          setServices={setServices}
          onSubmit={handleSubmit}
          onBack={() => setStep(2)}
        />
      )}
    </div>
  );
};

export default OnboardingForm;