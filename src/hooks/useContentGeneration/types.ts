import type { BusinessInfo } from "@/lib/types";

export interface ContentEntry {
  company_id: string;
  service_id: string;
  location_id?: string;
  title: string;
  type: "service" | "location" | "blog";
}

export interface CompanyData {
  id: string;
  name: string;
  industry: string;
  website: string;
}

export interface ServiceData {
  id: string;
  name: string;
}

export interface LocationData {
  id: string;
  location: string;
}