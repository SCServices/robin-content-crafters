import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { FileText, MapPin, Briefcase, NewspaperIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReactMarkdown from "react-markdown";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ContentItem } from "@/lib/types";

interface ContentListProps {
  items?: ContentItem[];
  companyId?: string;
}

const ContentList = ({ items: propItems, companyId }: ContentListProps) => {
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  const { data: items, isLoading } = useQuery({
    queryKey: ["content", companyId],
    queryFn: async () => {
      if (propItems) return propItems;
      
      const { data, error } = await supabase
        .from("generated_content")
        .select(`
          *,
          companies (name),
          services (name),
          service_locations (location)
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching content:", error);
        throw error;
      }

      return data as ContentItem[];
    },
    initialData: propItems,
    refetchInterval: (data) => {
      // Stop refetching if all items are either generated or errored
      const hasPendingItems = data?.some(
        (item) => item.status === "pending"
      );
      return hasPendingItems ? 3000 : false;
    },
    enabled: true,
  });

  const getIcon = (type: string) => {
    switch (type) {
      case "service":
        return <Briefcase className="h-5 w-5 text-primary" />;
      case "location":
        return <MapPin className="h-5 w-5 text-secondary" />;
      case "blog":
        return <NewspaperIcon className="h-5 w-5 text-success" />;
      default:
        return <FileText className="h-5 w-5 text-neutral-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "generated":
        return "bg-success";
      case "pending":
        return "bg-primary";
      case "error":
        return "bg-secondary";
      default:
        return "bg-neutral-400";
    }
  };

  const filteredItems = activeTab === "all" 
    ? items 
    : items?.filter(item => item.type === activeTab);

  if (isLoading) {
    return <div>Loading content...</div>;
  }

  if (!items?.length) {
    return (
      <Card className="p-6 text-center text-neutral-500">
        No content available yet.
      </Card>
    );
  }

  return (
    <>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="w-full justify-start bg-neutral-50 p-1">
          <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
          <TabsTrigger value="service" className="flex-1">Services</TabsTrigger>
          <TabsTrigger value="location" className="flex-1">Locations</TabsTrigger>
          <TabsTrigger value="blog" className="flex-1">Blog Posts</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-4">
        {filteredItems?.map((item) => (
          <Card
            key={item.id}
            className="p-4 hover:shadow-md transition-all duration-200 cursor-pointer border-l-4 hover:border-l-primary animate-fade-in"
            onClick={() => setSelectedContent(item)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getIcon(item.type)}
                <div>
                  <h3 className="font-medium text-lg">{item.title}</h3>
                  <p className="text-sm text-neutral-500">
                    {item.companies?.name} • {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="capitalize">
                  {item.type}
                </Badge>
                <div
                  className={`h-2 w-2 rounded-full ${getStatusColor(item.status)}`}
                  title={`Status: ${item.status}`}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedContent} onOpenChange={() => setSelectedContent(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-primary mb-4">
              {selectedContent?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {selectedContent?.content ? (
              <article className="prose prose-lg prose-primary max-w-none">
                <ReactMarkdown>{selectedContent.content}</ReactMarkdown>
              </article>
            ) : (
              <p className="text-neutral-500 italic text-center py-8">
                Content is still being generated...
              </p>
            )}
          </div>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setSelectedContent(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ContentList;