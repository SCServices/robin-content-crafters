import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface CompanySelectorProps {
  selectedCompanyId: string;
  onCompanySelect: (id: string) => void;
}

const CompanySelector = ({ selectedCompanyId, onCompanySelect }: CompanySelectorProps) => {
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

  if (!companies || companies.length === 0) return null;

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-neutral-100 max-w-md mx-auto">
      <Label htmlFor="companySelect" className="block text-sm font-medium text-neutral-700 mb-2">
        Select an existing company to pre-fill information
      </Label>
      <Select value={selectedCompanyId} onValueChange={onCompanySelect}>
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
  );
};

export default CompanySelector;