import { supabase } from "@/integrations/supabase/client";
import type { BusinessInfo } from "@/lib/types";
import type { CompanyData } from "./types";

export async function handleCompanyCreation(businessInfo: BusinessInfo) {
  // Check if company exists and create/update it
  const { data: existingCompany } = await supabase
    .from("companies")
    .select("*")
    .eq("name", businessInfo.companyName)
    .limit(1);

  let companyData;

  if (existingCompany && existingCompany.length > 0) {
    const { data: updatedCompany, error: updateError } = await supabase
      .from("companies")
      .update({
        industry: businessInfo.industry,
        website: businessInfo.website,
      })
      .eq("id", existingCompany[0].id)
      .select()
      .single();

    if (updateError) throw updateError;
    companyData = updatedCompany;

    await supabase.from("services").delete().eq("company_id", companyData.id);
    await supabase.from("service_locations").delete().eq("company_id", companyData.id);
  } else {
    const { data: newCompany, error: companyError } = await supabase
      .from("companies")
      .insert({
        name: businessInfo.companyName,
        industry: businessInfo.industry,
        website: businessInfo.website,
      })
      .select()
      .single();

    if (companyError) throw companyError;
    companyData = newCompany;
  }

  // Insert services and locations
  const { data: servicesData } = await supabase
    .from("services")
    .insert(
      businessInfo.services.map((service) => ({
        company_id: companyData.id,
        name: service,
      }))
    )
    .select();

  const { data: locationsData } = await supabase
    .from("service_locations")
    .insert(
      businessInfo.locations.map((location) => ({
        company_id: companyData.id,
        location: location,
      }))
    )
    .select();

  return { companyData, servicesData, locationsData };
}