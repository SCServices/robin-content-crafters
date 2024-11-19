import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface LocationsStepProps {
  locations: string[];
  setLocations: (locations: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const LocationsStep = ({ locations, setLocations, onNext, onBack }: LocationsStepProps) => {
  const [newLocation, setNewLocation] = useState("");

  const addLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (newLocation && locations.length < 5) {
      setLocations([...locations, newLocation]);
      setNewLocation("");
    }
  };

  const removeLocation = (index: number) => {
    setLocations(locations.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <form onSubmit={addLocation} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="location">Add Service Location (max 5)</Label>
          <div className="flex gap-2">
            <Input
              id="location"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              placeholder="Enter city, state"
              disabled={locations.length >= 5}
            />
            <Button
              type="submit"
              variant="outline"
              disabled={locations.length >= 5 || !newLocation}
            >
              Add
            </Button>
          </div>
        </div>
      </form>

      <div className="space-y-2">
        {locations.map((location, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-2 bg-neutral-50 rounded-lg"
          >
            <span>{location}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeLocation(index)}
              className="text-neutral-500 hover:text-red-500"
            >
              <X size={16} />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex-1"
        >
          Back
        </Button>
        <Button
          onClick={onNext}
          className="flex-1 bg-primary hover:bg-primary-dark text-white"
          disabled={locations.length === 0}
        >
          Next Step
        </Button>
      </div>
    </div>
  );
};

export default LocationsStep;