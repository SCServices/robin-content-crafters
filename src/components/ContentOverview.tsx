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
import { CheckCircle, Clock, AlertCircle, Copy, Pencil, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const ContentOverview = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["content"],
    queryFn: async () => {
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
  });

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("generated_content")
        .delete()
        .eq("id", id);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["content"] });
      toast.success("Content deleted successfully");
      setSelectedItem(null);
    } catch (error) {
      console.error("Error deleting content:", error);
      toast.error("Failed to delete content");
    }
  };

  const handleEdit = (content: string) => {
    setSelectedItem((prev: any) => ({
      ...prev,
      content: content
    }));
    setEditedContent(content);
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from("generated_content")
        .update({ content: editedContent })
        .eq("id", selectedItem.id);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["content"] });
      setIsEditing(false);
      toast.success("Content updated successfully");
    } catch (error) {
      toast.error("Failed to update content");
    }
  };

  const handleCopy = async () => {
    try {
      const contentElement = document.querySelector(`[data-dialog-rendered-content-id="${selectedItem?.id}"]`);
      if (!contentElement) {
        throw new Error("Content element not found");
      }

      const range = document.createRange();
      const selection = window.getSelection();
      
      range.selectNodeContents(contentElement);
      selection?.removeAllRanges();
      selection?.addRange(range);
      
      document.execCommand('copy');
      selection?.removeAllRanges();
      
      toast.success("Content copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy content");
    }
  };

  const filteredItems = activeTab === "all" 
    ? items 
    : items.filter(item => item.type === activeTab);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "generated":
        return <CheckCircle className="text-success" size={16} />;
      case "pending":
        return <Clock className="text-primary" size={16} />;
      case "error":
        return <AlertCircle className="text-secondary" size={16} />;
      default:
        return <Clock className="text-primary" size={16} />;
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6 animate-fade-in bg-white/50 backdrop-blur-sm">
        <div className="h-48 flex items-center justify-center">
          <Clock className="animate-spin text-primary" size={24} />
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
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-all duration-200 cursor-pointer border-l-2 hover:border-l-primary"
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(item.status)}
                    <span className="font-medium">{item.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-neutral-500 capitalize px-3 py-1 bg-white rounded-full">
                      {item.type}
                    </span>
                  </div>
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
            {selectedItem?.content ? (
              <article className="prose prose-lg prose-primary max-w-none">
                <div data-dialog-rendered-content-id={selectedItem?.id}>
                  <ReactMarkdown>{selectedItem.content}</ReactMarkdown>
                </div>
              </article>
            ) : (
              <p className="text-neutral-500 italic text-center py-8">
                Content is still being generated...
              </p>
            )}
          </div>
          <DialogFooter className="mt-6 flex justify-between">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleEdit(selectedItem.content)}
                className="text-secondary hover:bg-secondary/10"
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                onClick={handleCopy}
                className="text-primary hover:bg-primary/10"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete this content from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(selectedItem.id)}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
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