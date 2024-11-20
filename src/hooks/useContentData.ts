import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { ContentItem } from "@/lib/types";

export const useContentData = (companyId?: string, initialData?: ContentItem[]) => {
  return useQuery({
    queryKey: ["content", companyId],
    queryFn: async () => {
      if (initialData) return initialData;
      
      const { data, error } = await supabase
        .from("generated_content")
        .select(`
          *,
          companies (name),
          services (name),
          service_locations (location)
        `)
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Failed to fetch content");
        throw error;
      }
      return data;
    },
    initialData,
  });
};