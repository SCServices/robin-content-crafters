import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ContentItem } from "@/lib/types";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";

interface ContentOverviewProps {
  items: ContentItem[];
}

const ContentOverview = ({ items }: ContentOverviewProps) => {
  const [activeTab, setActiveTab] = useState("all");

  const filteredItems = activeTab === "all" 
    ? items 
    : items.filter(item => item.type === activeTab);

  const getStatusIcon = (status: ContentItem["status"]) => {
    switch (status) {
      case "generated":
        return <CheckCircle className="text-success" size={16} />;
      case "pending":
        return <Clock className="text-primary" size={16} />;
      case "error":
        return <AlertCircle className="text-secondary" size={16} />;
    }
  };

  return (
    <Card className="p-6 animate-fade-in">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Content Overview</h2>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="service">Services</TabsTrigger>
            <TabsTrigger value="location">Locations</TabsTrigger>
            <TabsTrigger value="blog">Blog Posts</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={activeTab} className="mt-0">
          <div className="space-y-2">
            {filteredItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(item.status)}
                  <span>{item.title}</span>
                </div>
                <span className="text-sm text-neutral-500 capitalize">{item.type}</span>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default ContentOverview;