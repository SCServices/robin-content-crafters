import type { BusinessInfo } from "@/lib/types";

export interface CompanyInfo {
  companyName: string;
  industry: string;
  serviceName: string;
  companyId: string;
  location?: string;
}

export interface ContentGenerationProgress {
  isGenerating: boolean;
  progress: number;
}

export interface ContentGenerationResult {
  success: boolean;
  error?: any;
}