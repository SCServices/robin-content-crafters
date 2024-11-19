import { supabase } from "@/integrations/supabase/client";
import type { BusinessInfo } from "@/lib/types";
import type { ContentEntry, CompanyData, ServiceData } from "./types";

export async function generateContent(
  contentEntries: ContentEntry[],
  businessInfo: BusinessInfo,
  servicesData: ServiceData[] | null,
  companyData: CompanyData,
  onProgress: (progress: number) => void
) {
  const totalItems = contentEntries.length;
  let completedItems = 0;

  for (const entry of contentEntries) {
    await supabase.functions.invoke("generate-content", {
      body: {
        contentType: entry.type,
        companyInfo: {
          companyName: businessInfo.companyName,
          industry: businessInfo.industry,
          serviceName: servicesData?.find(s => s.id === entry.service_id)?.name,
          companyId: companyData.id,
        },
        serviceId: entry.service_id,
        locationId: entry.location_id,
      },
    });

    completedItems++;
    onProgress(completedItems / totalItems);
  }
}