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
import { FileText, MapPin, Briefcase, NewspaperIcon, Trash2, Copy, Pencil, Check, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Textarea } from "@/components/ui/textarea";

interface ContentListProps {
  items: any[];
}

const ContentList = ({ items }: ContentListProps) => {
  const [selectedContent, setSelectedContent] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const queryClient = useQueryClient();

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

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { error } = await supabase
        .from("generated_content")
        .delete()
        .eq("id", id);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["content"] });
      toast.success("Content deleted successfully");
      setSelectedContent(null);
    } catch (error) {
      console.error("Error deleting content:", error);
      toast.error("Failed to delete content");
    }
  };

  const handleCopy = async (content: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(content);
      toast.success("Content copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy content");
    }
  };

  const handleEdit = (content: string) => {
    setEditedContent(content);
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from("generated_content")
        .update({ content: editedContent })
        .eq("id", selectedContent.id);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["content"] });
      setIsEditing(false);
      toast.success("Content updated successfully");
    } catch (error) {
      toast.error("Failed to update content");
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedContent("");
  };

  const filteredItems = activeTab === "all" 
    ? items 
    : items.filter(item => item.type === activeTab);

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
        {filteredItems.map((item) => (
          <Card
            key={item.id}
            className="p-4 hover:shadow-md transition-all duration-200 cursor-pointer border-l-4 hover:border-l-primary animate-fade-in group"
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
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-primary/10"
                    onClick={(e) => handleCopy(item.content, e)}
                  >
                    <Copy className="h-4 w-4 text-primary hover:text-primary-dark" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-secondary/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(item.content);
                    }}
                  >
                    <Pencil className="h-4 w-4 text-secondary hover:text-secondary-dark" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-destructive/10"
                    onClick={(e) => handleDelete(item.id, e)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive hover:text-destructive/80" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedContent} onOpenChange={() => {
        setSelectedContent(null);
        setIsEditing(false);
        setEditedContent("");
      }}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-primary mb-4">
              {selectedContent?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {selectedContent?.content ? (
              isEditing ? (
                <Textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="min-h-[400px] font-mono text-sm"
                />
              ) : (
                <article className="prose prose-lg prose-primary max-w-none">
                  <ReactMarkdown>{selectedContent.content}</ReactMarkdown>
                </article>
              )
            ) : (
              <p className="text-neutral-500 italic text-center py-8">
                Content is still being generated...
              </p>
            )}
          </div>
          <DialogFooter className="mt-6 flex justify-between">
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button
                    variant="default"
                    onClick={handleSave}
                    className="bg-success hover:bg-success/90"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancelEdit}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => handleCopy(selectedContent.content, new MouseEvent('click'))}
                    className="text-primary hover:bg-primary/10"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleEdit(selectedContent.content)}
                    className="text-secondary hover:bg-secondary/10"
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={(e) => {
                      handleDelete(selectedContent.id, e);
                      setSelectedContent(null);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </>
              )}
            </div>
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