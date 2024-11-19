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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { ContentItem } from "@/lib/types";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface ContentOverviewProps {
  items: ContentItem[];
}

const ContentOverview = ({ items }: ContentOverviewProps) => {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<string>("all");

  // Get unique companies from items
  const companies = Array.from(new Set(items.map(item => item.companies?.name))).filter(Boolean);

  // Filter items by both company and type
  const filteredItems = items.filter(item => {
    const matchesCompany = selectedCompany === "all" || item.companies?.name === selectedCompany;
    const matchesType = activeTab === "all" || item.type === activeTab;
    return matchesCompany && matchesType;
  });

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
      <Card className="p-6 animate-fade-in bg-white/50 backdrop-blur-sm">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
              Content Overview
            </h2>
            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
              <SelectTrigger className="w-[200px] bg-white">
                <SelectValue placeholder="Select a company" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All Companies</SelectItem>
                {companies.map((company) => (
                  <SelectItem key={company} value={company}>
                    {company}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-neutral-50">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="service">Services</TabsTrigger>
              <TabsTrigger value="location">Locations</TabsTrigger>
              <TabsTrigger value="blog">Blog Posts</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              <div className="space-y-2">
                {filteredItems.map((item, index) => (
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
        </div>
      </Card>

      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-primary mb-4">
              {selectedItem?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {selectedItem?.content ? (
              <article className="prose prose-lg prose-primary max-w-none">
                <ReactMarkdown>{selectedItem.content}</ReactMarkdown>
              </article>
            ) : (
              <p className="text-neutral-500 italic text-center py-8">
                Content is still being generated...
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