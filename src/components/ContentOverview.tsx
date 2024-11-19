import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useContentItems } from "@/hooks/useContentItems";
import { Skeleton } from "@/components/ui/skeleton";

const ContentOverview = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const { data: items, isLoading } = useContentItems();

  const filteredItems = activeTab === "all" 
    ? items 
    : items?.filter(item => item.type === activeTab);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "generated":
        return <CheckCircle className="text-success" size={16} />;
      case "pending":
        return <Clock className="text-primary" size={16} />;
      case "error":
        return <AlertCircle className="text-secondary" size={16} />;
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-64" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-6 animate-fade-in bg-white/50 backdrop-blur-sm">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
              Content Overview
            </h2>
            <TabsList className="bg-neutral-50">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="service">Services</TabsTrigger>
              <TabsTrigger value="location">Locations</TabsTrigger>
              <TabsTrigger value="blog">Blog Posts</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value={activeTab} className="mt-0">
            <div className="space-y-2">
              {filteredItems?.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-all duration-200 cursor-pointer border-l-2 hover:border-l-primary"
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(item.status)}
                    <span className="font-medium">{item.title}</span>
                  </div>
                  <span className="text-sm text-neutral-500 capitalize px-3 py-1 bg-white rounded-full">
                    {item.type}
                  </span>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-primary mb-4">
              {selectedItem?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {selectedItem?.status === "pending" ? (
              <p className="text-neutral-500 italic text-center py-8">
                Content is still being generated...
              </p>
            ) : selectedItem?.content ? (
              <article className="prose prose-lg prose-primary max-w-none">
                <ReactMarkdown>{selectedItem.content}</ReactMarkdown>
              </article>
            ) : (
              <p className="text-neutral-500 italic text-center py-8">
                No content available
              </p>
            )}
          </div>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setSelectedItem(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ContentOverview;