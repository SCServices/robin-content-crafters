import { useState, useEffect } from "react";
import BusinessInfoStep from "./BusinessInfoStep";
import LocationsStep from "./LocationsStep";
import ServicesStep from "./ServicesStep";
import type { BusinessInfo } from "@/lib/types";
import { useContentGeneration } from "@/hooks/useContentGeneration";
import { supabase } from "@/integrations/supabase/client";

interface OnboardingFormProps {
  onComplete: (data: BusinessInfo) => void;
  initialData?: BusinessInfo;
}

const OnboardingForm = ({ onComplete, initialData }: OnboardingFormProps) => {
  const [step, setStep] = useState(1);
  const [companyName, setCompanyName] = useState(initialData?.companyName || "");
  const [industry, setIndustry] = useState(initialData?.industry || "");
  const [website, setWebsite] = useState(initialData?.website || "");
  const [locations, setLocations] = useState<string[]>(initialData?.locations || []);
  const [services, setServices] = useState<string[]>(initialData?.services || []);
  
  const { createCompanyAndContent, isGenerating } = useContentGeneration();

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      if (initialData?.companyName) {
        // Fetch company ID first
        const { data: companyData } = await supabase
          .from("companies")
          .select("id")
          .eq("name", initialData.companyName)
          .single();

        if (companyData) {
          // Fetch locations
          const { data: locationData } = await supabase
            .from("service_locations")
            .select("location")
            .eq("company_id", companyData.id);

          // Fetch services
          const { data: serviceData } = await supabase
            .from("services")
            .select("name")
            .eq("company_id", companyData.id);

          setLocations(locationData?.map(l => l.location) || []);
          setServices(serviceData?.map(s => s.name) || []);
        }
      }
    };

    fetchCompanyDetails();
  }, [initialData]);

  useEffect(() => {
    if (initialData) {
      setCompanyName(initialData.companyName);
      setIndustry(initialData.industry);
      setWebsite(initialData.website);
    }
  }, [initialData]);

  const handleSubmit = async () => {
    const businessInfo: BusinessInfo = {
      companyName,
      industry,
      website,
      locations,
      services,
    };
    
    const { success } = await createCompanyAndContent(businessInfo);
    if (success) {
      onComplete(businessInfo);
    }
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
          isGenerating={isGenerating}
        />
      )}
    </div>
  );
};

export default OnboardingForm;