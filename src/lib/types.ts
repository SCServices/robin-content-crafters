export interface BusinessInfo {
  companyName: string;
  industry: string;
  website: string;
  locations: string[];
  services: string[];
  servicePrompt?: string;
  locationPrompt?: string;
  blogPrompt?: string;
}

export interface ContentItem {
  title: string;
  type: "service" | "location" | "blog";
  status: "pending" | "generated" | "error";
  content?: string;
}

export interface ContentStats {
  total: number;
  generated: number;
  pending: number;
  error: number;
}