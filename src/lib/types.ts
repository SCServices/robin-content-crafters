export interface BusinessInfo {
  companyName: string;
  industry: string;
  website: string;
  locations: string[];
  services: string[];
}

export interface ContentItem {
  title: string;
  type: "service" | "location" | "blog";
  status: "pending" | "generated" | "error";
  content?: string;
  companies: {
    id: string;
    name: string;
    industry: string;
    website: string;
    created_at: string;
    updated_at: string;
  };
}

export interface ContentStats {
  total: number;
  generated: number;
  pending: number;
  error: number;
}