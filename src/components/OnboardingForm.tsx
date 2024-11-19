import { useState } from "react";
import BusinessInfoStep from "./BusinessInfoStep";
import LocationsStep from "./LocationsStep";
import ServicesStep from "./ServicesStep";
import type { BusinessInfo } from "@/lib/types";
import { useContentGeneration } from "@/hooks/useContentGeneration";

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
  
  const { createCompanyAndContent, isGenerating } = useContentGeneration();

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