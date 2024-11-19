import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Globe, Factory, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tables } from "@/integrations/supabase/types";
import Layout from "@/components/Layout";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

type Company = Tables<"companies">;

interface EditCompanyFormProps {
  company: Company;
  onClose: () => void;
}

const EditCompanyForm = ({ company, onClose }: EditCompanyFormProps) => {
  const [name, setName] = useState(company.name);
  const [industry, setIndustry] = useState(company.industry);
  const [website, setWebsite] = useState(company.website);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { error } = await supabase
      .from("companies")
      .update({ name, industry, website })
      .eq("id", company.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update company information",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Company information updated successfully",
    });
    
    queryClient.invalidateQueries({ queryKey: ["companies"] });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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

      <div className="flex justify-end gap-2">
        <Button variant="outline" type="button" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">Save Changes</Button>
      </div>
    </form>
  );
};

const Companies = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  const { data: companies, isLoading } = useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Company[];
    },
  });

  const handleDelete = async (companyId: string) => {
    const { error } = await supabase
      .from("companies")
      .delete()
      .eq("id", companyId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete company",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Company deleted successfully",
    });
    
    queryClient.invalidateQueries({ queryKey: ["companies"] });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="p-8">
          <div className="h-8 w-48 bg-neutral-200 animate-pulse rounded-md mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-neutral-200 animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Companies</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies?.map((company) => (
            <Card key={company.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    {company.name}
                  </div>
                  <div className="flex items-center gap-2">
                    <Dialog open={editingCompany?.id === company.id} onOpenChange={(open) => !open && setEditingCompany(null)}>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-neutral-500 hover:text-primary"
                          onClick={() => setEditingCompany(company)}
                        >
                          <Pencil size={16} />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Company Information</DialogTitle>
                        </DialogHeader>
                        {editingCompany && (
                          <EditCompanyForm
                            company={editingCompany}
                            onClose={() => setEditingCompany(null)}
                          />
                        )}
                      </DialogContent>
                    </Dialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-neutral-500 hover:text-red-500"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Company</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete {company.name}? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(company.id)}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <Factory className="h-4 w-4" />
                    {company.industry}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <Globe className="h-4 w-4" />
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {company.website}
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Companies;