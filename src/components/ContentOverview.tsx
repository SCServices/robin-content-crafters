import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { ContentItem } from "@/lib/types";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";

interface ContentOverviewProps {
  items: ContentItem[];
}

const ContentOverview = ({ items }: ContentOverviewProps) => {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);

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
    <>
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
                  className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
                  onClick={() => setSelectedItem(item)}
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

      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedItem?.title}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <div className="prose max-w-none">
              {selectedItem?.content ? (
                <div dangerouslySetInnerHTML={{ __html: selectedItem.content }} />
              ) : (
                <p className="text-neutral-500 italic">
                  Content is still being generated...
                </p>
              )}
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button variant="outline" onClick={() => setSelectedItem(null)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ContentOverview;