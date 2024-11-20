import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import Dashboard from "@/components/Dashboard";
import ContentList from "@/components/ContentList";
import { calculateContentStats } from "@/utils/statsCalculation";
import { useContentData } from "@/hooks/useContentData";
import type { ContentStats } from "@/lib/types";

interface ContentOverviewProps {
  companyId?: string;
}

const ContentOverview = ({ companyId }: ContentOverviewProps) => {
  const [stats, setStats] = useState<ContentStats>({
    total: 0,
    generated: 0,
    pending: 0,
    error: 0,
  });

  const { data: items } = useContentData(companyId);

  useEffect(() => {
    if (items) {
      const newStats = calculateContentStats(items);
      setStats(newStats);
    }
  }, [items]);

  return (
    <div className="space-y-8 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="animate-fade-in">
        <Dashboard stats={stats} />
      </div>
      <Card className="p-4 sm:p-6 animate-fade-in delay-100">
        <ContentList items={items} />
      </Card>
    </div>
  );
};

export default ContentOverview;