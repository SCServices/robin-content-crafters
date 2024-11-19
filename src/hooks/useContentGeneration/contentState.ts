import { useState } from "react";
import type { ContentItem, ContentStats } from "@/lib/types";

export const useContentState = () => {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [contentStats, setContentStats] = useState<ContentStats>({
    total: 0,
    generated: 0,
    pending: 0,
    error: 0,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const updateContentStats = (items: ContentItem[]) => {
    const stats = items.reduce(
      (acc, item) => {
        acc[item.status]++;
        return acc;
      },
      { total: items.length, generated: 0, pending: 0, error: 0 }
    );
    setContentStats(stats);
    
    // Update progress based on generated content
    const newProgress = (stats.generated / stats.total) * 100;
    setProgress(newProgress);
  };

  return {
    contentItems,
    setContentItems,
    contentStats,
    updateContentStats,
    isGenerating,
    setIsGenerating,
    progress,
    setProgress,
  };
};