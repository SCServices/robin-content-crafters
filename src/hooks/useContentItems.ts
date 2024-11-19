import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useContentItems = () => {
  return useQuery({
    queryKey: ["content"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("generated_content")
        .select(`
          *,
          companies (name),
          services (name),
          service_locations (location)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};