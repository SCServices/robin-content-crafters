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
import { CheckCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface ContentOverviewProps {
  items: ContentItem[];
}

const ContentOverview = ({ items }: ContentOverviewProps) => {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<string>("all");

  // Get unique companies from items
  const companies = Array.from(new Set(items.map(item => item.company?.name))).filter(Boolean);

  // Filter items by both company and type
  const filteredItems = items.filter(item => {
    const matchesCompany = selectedCompany === "all" || item.company?.name === selectedCompany;
    const matchesType = activeTab === "all" || item.type === activeTab;
    return matchesCompany && matchesType;
  });

  return (
    <>
      <Card className="p-6 animate-fade-in bg-white/50 backdrop-blur-sm">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-primary">
              Content Overview
            </h2>
            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
              <SelectTrigger className="w-[200px] bg-white">
                <SelectValue placeholder="All Companies" />
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
            <TabsList className="w-full space-x-2 bg-transparent">
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
                    className="flex items-center justify-between p-4 bg-white rounded-lg hover:bg-neutral-50 transition-all duration-200 cursor-pointer"
                    onClick={() => setSelectedItem(item)}
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle className="text-emerald-500" size={16} />
                      <span className="font-medium">{item.title}</span>
                    </div>
                    <span className="text-sm text-neutral-500 capitalize">
                      {item.type}
                    </span>
                  </div>
                ))}

                {filteredItems.length === 0 && (
                  <div className="text-center py-8 text-neutral-500">
                    No content items found
                  </div>
                )}
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