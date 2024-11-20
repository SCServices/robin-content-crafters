export interface BusinessInfo {
  companyName: string;
  industry: string;
  website: string;
  locations: string[];
  services: string[];
}

export interface ContentItem {
  id: string;
  company_id: string;
  title: string;
  content: string | null;
  type: "service" | "location" | "blog";
  status: "pending" | "generated" | "error";
  service_id: string | null;
  location_id: string | null;
  parent_content_id: string | null;
  created_at: string;
  updated_at: string;
  meta_description: string | null;
  companies?: {
    name: string;
  };
  services?: {
    name: string;
  };
  service_locations?: {
    location: string;
  };
}

export interface ContentStats {
  total: number;
  generated: number;
  pending: number;
  error: number;
}