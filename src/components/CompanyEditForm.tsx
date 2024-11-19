import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Company = Tables<"companies">;

interface CompanyEditFormProps {
  company: Company;
  onClose: () => void;
}

const CompanyEditForm = ({ company, onClose }: CompanyEditFormProps) => {
  const [name, setName] = useState(company.name);
  const [industry, setIndustry] = useState(company.industry);
  const [website, setWebsite] = useState(company.website);
  const [locations, setLocations] = useState<string[]>([]);
  const [services, setServices] = useState<string[]>([]);
  const [newLocation, setNewLocation] = useState("");
  const [newService, setNewService] = useState("");

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      // Fetch locations
      const { data: locationData } = await supabase
        .from("service_locations")
        .select("location")
        .eq("company_id", company.id);

      // Fetch services
      const { data: serviceData } = await supabase
        .from("services")
        .select("name")
        .eq("company_id", company.id);

      setLocations(locationData?.map(l => l.location) || []);
      setServices(serviceData?.map(s => s.name) || []);
    };

    fetchCompanyDetails();
  }, [company.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Update company info
    const { error: companyError } = await supabase
      .from("companies")
      .update({ name, industry, website })
      .eq("id", company.id);

    if (companyError) {
      toast.error("Failed to update company information");
      return;
    }

    // Delete existing locations and services
    await supabase.from("service_locations").delete().eq("company_id", company.id);
    await supabase.from("services").delete().eq("company_id", company.id);

    // Insert new locations
    if (locations.length > 0) {
      const { error: locationError } = await supabase
        .from("service_locations")
        .insert(locations.map(location => ({
          company_id: company.id,
          location
        })));

      if (locationError) {
        toast.error("Failed to update locations");
        return;
      }
    }

    // Insert new services
    if (services.length > 0) {
      const { error: serviceError } = await supabase
        .from("services")
        .insert(services.map(name => ({
          company_id: company.id,
          name
        })));

      if (serviceError) {
        toast.error("Failed to update services");
        return;
      }
    }

    toast.success("Company information updated successfully");
    onClose();
  };

  const addLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (newLocation && locations.length < 5) {
      setLocations([...locations, newLocation]);
      setNewLocation("");
    }
  };

  const addService = (e: React.FormEvent) => {
    e.preventDefault();
    if (newService && services.length < 5) {
      setServices([...services, newService]);
      setNewService("");
    }
  };

  const removeLocation = (index: number) => {
    setLocations(locations.filter((_, i) => i !== index));
  };

  const removeService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Company Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="industry">Industry</Label>
        <Input
          id="industry"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          type="url"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          required
        />
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Service Locations (max 5)</Label>
          <div className="flex gap-2">
            <Input
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              placeholder="Enter location"
              disabled={locations.length >= 5}
            />
            <Button
              type="button"
              variant="outline"
              onClick={addLocation}
              disabled={locations.length >= 5 || !newLocation}
            >
              Add
            </Button>
          </div>
          <div className="space-y-2 mt-2">
            {locations.map((location, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-neutral-50 rounded-lg"
              >
                <span>{location}</span>
                <Button
                  type="button"
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
        </div>

        <div className="space-y-2">
          <Label>Services (max 5)</Label>
          <div className="flex gap-2">
            <Input
              value={newService}
              onChange={(e) => setNewService(e.target.value)}
              placeholder="Enter service"
              disabled={services.length >= 5}
            />
            <Button
              type="button"
              variant="outline"
              onClick={addService}
              disabled={services.length >= 5 || !newService}
            >
              Add
            </Button>
          </div>
          <div className="space-y-2 mt-2">
            {services.map((service, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-neutral-50 rounded-lg"
              >
                <span>{service}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeService(index)}
                  className="text-neutral-500 hover:text-red-500"
                >
                  <X size={16} />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" type="button" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">Save Changes</Button>
      </div>
    </form>
  );
};

export default CompanyEditForm;