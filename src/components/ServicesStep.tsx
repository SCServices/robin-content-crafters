import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ServicesStepProps {
  services: string[];
  setServices: (services: string[]) => void;
  onSubmit: () => void;
  onBack: () => void;
  isGenerating: boolean;
  progress?: number;
}

const ServicesStep = ({ 
  services, 
  setServices, 
  onSubmit, 
  onBack, 
  isGenerating,
  progress = 0
}: ServicesStepProps) => {
  const [newService, setNewService] = useState("");

  const addService = (e: React.FormEvent) => {
    e.preventDefault();
    if (newService && services.length < 5) {
      setServices([...services, newService]);
      setNewService("");
    }
  };

  const removeService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (services.length === 0) {
      toast.error("Please add at least one service");
      return;
    }
    onSubmit();
  };

  const getPhaseMessage = (progress: number) => {
    if (progress < 20) return "🚀 Phase 1/5: Setting up your business profile";
    if (progress < 40) return "🗺️ Phase 2/5: Mapping your service areas";
    if (progress < 60) return "✍️ Phase 3/5: Crafting engaging titles";
    if (progress < 95) return "📝 Phase 4/5: Creating your content";
    return "🎨 Phase 5/5: Applying final touches";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <form onSubmit={addService} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="service">Add Services (max 5)</Label>
          <div className="flex gap-2">
            <Input
              id="service"
              value={newService}
              onChange={(e) => setNewService(e.target.value)}
              placeholder="Enter service name"
              disabled={services.length >= 5 || isGenerating}
            />
            <Button
              type="submit"
              variant="outline"
              disabled={services.length >= 5 || !newService || isGenerating}
            >
              Add
            </Button>
          </div>
        </div>
      </form>

      <div className="space-y-2">
        {services.map((service, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-2 bg-neutral-50 rounded-lg"
          >
            <span>{service}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeService(index)}
              className="text-neutral-500 hover:text-red-500"
              disabled={isGenerating}
            >
              <X size={16} />
            </Button>
          </div>
        ))}
      </div>

      {isGenerating && (
        <div className="space-y-4">
          <Progress value={progress} className="w-full" />
          <div className="text-center space-y-2">
            <p className="text-lg font-medium text-primary">
              {getPhaseMessage(progress)}
            </p>
            <p className="text-sm text-neutral-600">
              Overall progress: {Math.round(progress)}%
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex-1"
          disabled={isGenerating}
        >
          Back
        </Button>
        <Button
          onClick={handleSubmit}
          className="flex-1 bg-primary hover:bg-primary-dark text-white"
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate Content"
          )}
        </Button>
      </div>
    </div>
  );
};

export default ServicesStep;