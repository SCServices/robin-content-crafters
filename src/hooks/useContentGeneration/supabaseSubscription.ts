import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { ContentItem } from "@/lib/types";

export const useContentSubscription = (
  companyId: string | null,
  onContentUpdate: (items: ContentItem[]) => void
) => {
  useEffect(() => {
    if (!companyId) return;

    // Subscribe to content updates for this company
    const subscription = supabase
      .channel('generated_content_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'generated_content',
          filter: `company_id=eq.${companyId}`,
        },
        async (payload) => {
          // Fetch all content items for this company to ensure UI is in sync
          const { data: items } = await supabase
            .from("generated_content")
            .select(`
              *,
              companies (name),
              services (name),
              service_locations (location)
            `)
            .eq('company_id', companyId)
            .order('created_at', { ascending: false });

          if (items) {
            onContentUpdate(items);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [companyId, onContentUpdate]);
};