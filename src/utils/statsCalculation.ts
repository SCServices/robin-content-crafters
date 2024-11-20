import type { ContentItem, ContentStats } from "@/lib/types";

export const calculateContentStats = (items: ContentItem[]): ContentStats => {
  return {
    total: items.length,
    generated: items.filter(item => item.status === "generated").length,
    pending: items.filter(item => item.status === "pending").length,
    error: items.filter(item => item.status === "error").length,
  };
};