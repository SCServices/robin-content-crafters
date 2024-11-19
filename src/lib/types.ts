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
  companies?: {
    name: string;
  };
}

export interface ContentStats {
  total: number;
  generated: number;
  pending: number;
  error: number;
}