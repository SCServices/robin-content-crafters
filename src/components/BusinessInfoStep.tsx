import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BusinessInfoStepProps {
  companyName: string;
  setCompanyName: (value: string) => void;
  industry: string;
  setIndustry: (value: string) => void;
  website: string;
  setWebsite: (value: string) => void;
  onNext: () => void;
}

const INDUSTRIES = [
  "Plumbing",
  "Electrical",
  "HVAC",
  "Landscaping",
  "Cleaning",
  "Construction",
  "Roofing",
  "Painting",
  "Carpentry",
  "Auto Repair",
];

const BusinessInfoStep = ({
  companyName,
  setCompanyName,
  industry,
  setIndustry,
  website,
  setWebsite,
  onNext,
}: BusinessInfoStepProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <Label htmlFor="companyName">Company Name</Label>
        <Input
          id="companyName"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="Enter your company name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="industry">Industry</Label>
        <Select value={industry} onValueChange={setIndustry} required>
          <SelectTrigger>
            <SelectValue placeholder="Select your industry" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {INDUSTRIES.map((ind) => (
              <SelectItem key={ind} value={ind.toLowerCase()}>
                {ind}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="website">Website URL</Label>
        <Input
          id="website"
          type="url"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="https://example.com"
          required
        />
      </div>

      <button
        type="submit"
        className="w-full px-4 py-2 text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors"
      >
        Next Step
      </button>
    </form>
  );
};

export default BusinessInfoStep;