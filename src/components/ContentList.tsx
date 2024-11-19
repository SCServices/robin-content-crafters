import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { FileText, MapPin, Briefcase, NewspaperIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ContentListProps {
  items: any[];
}

const ContentList = ({ items }: ContentListProps) => {
  const [selectedContent, setSelectedContent] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  const getIcon = (type: string) => {
    switch (type) {
      case "service":
        return <Briefcase className="h-5 w-5" />;
      case "location":
        return <MapPin className="h-5 w-5" />;
      case "blog":
        return <NewspaperIcon className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "generated":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const filteredItems = activeTab === "all" 
    ? items 
    : items.filter(item => item.type === activeTab);

  return (
    <>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="service">Services</TabsTrigger>
          <TabsTrigger value="location">Locations</TabsTrigger>
          <TabsTrigger value="blog">Blog Posts</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-4">
        {filteredItems.map((item) => (
          <Card
            key={item.id}
            className="p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedContent(item)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getIcon(item.type)}
                <div>
                  <h3 className="font-medium">{item.title}</h3>
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

      <Dialog open={!!selectedContent} onOpenChange={() => setSelectedContent(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedContent?.title}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <div className="prose max-w-none">
              {selectedContent?.content ? (
                <div dangerouslySetInnerHTML={{ __html: selectedContent.content }} />
              ) : (
                <p className="text-neutral-500 italic">
                  Content is still being generated...
                </p>
              )}
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button variant="outline" onClick={() => setSelectedContent(null)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ContentList;