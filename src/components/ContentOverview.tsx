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

interface ContentOverviewProps {
  items?: ContentItem[];
  companyId?: string;
}

const ContentOverview = ({ items: propItems, companyId }: ContentOverviewProps) => {
  const [selectedContent, setSelectedContent] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  const { data: items } = useQuery({
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

      if (error) throw error;
      return data;
    },
    enabled: !propItems,
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
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </Card>

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

export default ContentOverview;