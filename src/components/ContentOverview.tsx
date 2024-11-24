import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { WaitingRoom } from "./waiting-room/WaitingRoom";
import { ContentDialog } from "./content/ContentDialog";

const ContentOverview = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [generationProgress, setGenerationProgress] = useState(0);
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["content"],
    queryFn: async () => {
      // First, get all content ordered by created_at
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
      return data || [];
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

  const filteredItems = activeTab === "all" 
    ? items 
    : items.filter(item => item.type === activeTab);

  useEffect(() => {
    if (items?.some(item => item.status === 'pending')) {
      const interval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 1;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [items]);

  const handleGenerationComplete = () => {
    queryClient.invalidateQueries({ queryKey: ["content"] });
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
              Latest Generated Content
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
              {filteredItems.length === 0 ? (
                <div className="text-center py-8 text-neutral-500">
                  No content generated yet
                </div>
              ) : (
                filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-all duration-200 cursor-pointer border-l-2 hover:border-l-primary"
                    onClick={() => setSelectedItem(item)}
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle className={`text-${item.status === "generated" ? "success" : "primary"}`} size={16} />
                      <span className="font-medium">{item.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-neutral-500 capitalize px-3 py-1 bg-white rounded-full">
                        {item.type}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      <ContentDialog
        selectedContent={selectedItem}
        isEditing={isEditing}
        editedContent={editedContent}
        onClose={() => setSelectedItem(null)}
        onEdit={(content) => {
          setEditedContent(content);
          setIsEditing(true);
        }}
        onSave={handleSave}
        onCancelEdit={() => setIsEditing(false)}
        onDelete={handleDelete}
        setEditedContent={setEditedContent}
      />

      <WaitingRoom
        isGenerating={items?.some(item => item.status === 'pending')}
        progress={generationProgress}
        onComplete={handleGenerationComplete}
      />
    </>
  );
};

export default ContentOverview;
