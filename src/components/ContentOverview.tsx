import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import Dashboard from "@/components/Dashboard";
import ContentList from "@/components/ContentList";
import type { ContentItem, ContentStats } from "@/lib/types";

interface ContentOverviewProps {
  items: ContentItem[];
}

const ContentOverview = ({ items }: ContentOverviewProps) => {
  const [stats, setStats] = useState<ContentStats>({
    total: 0,
    generated: 0,
    pending: 0,
    error: 0,
  });

  useEffect(() => {
    // Calculate stats based on items
    const newStats = {
      total: items.length,
      generated: items.filter(item => item.status === "generated").length,
      pending: items.filter(item => item.status === "pending").length,
      error: items.filter(item => item.status === "error").length,
    };
    setStats(newStats);
  }, [items]);

  return (
    <div className="space-y-8">
      <Dashboard stats={stats} />
      <Card className="p-6">
        <ContentList items={items} />
      </Card>
    </div>
  );
};

export default ContentOverview;