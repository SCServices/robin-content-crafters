import { supabase } from "@/integrations/supabase/client";
import type { ContentItem } from "@/lib/types";

export const useContentSubscription = (
  companyId: string | null,
  onUpdate: (items: ContentItem[]) => void
) => {
  const setupSubscription = async () => {
    if (!companyId) return;

    const channel = supabase
      .channel(`generated_content_${companyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'generated_content',
          filter: `company_id=eq.${companyId}`,
        },
        async () => {
          // Fetch the latest content items with full company data
          const { data: updatedItems } = await supabase
            .from('generated_content')
            .select(`
              *,
              companies (
                id,
                name,
                industry,
                website,
                created_at,
                updated_at
              )
            `)
            .eq('company_id', companyId)
            .order('created_at', { ascending: true });

          if (updatedItems) {
            onUpdate(updatedItems as ContentItem[]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  return setupSubscription;
};