import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { ContentItem } from "./content/ContentItem";
import { ContentDialog } from "./content/ContentDialog";

interface ContentListProps {
  items: any[];
}

const ContentList = ({ items }: ContentListProps) => {
  const [selectedContent, setSelectedContent] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const queryClient = useQueryClient();

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

  const handleEdit = (content: string) => {
    setSelectedContent((prev: any) => ({
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
          <ContentItem
            key={item.id}
            item={item}
            onSelect={() => setSelectedContent(item)}
            onEdit={() => {
              setSelectedContent(item);
              setEditedContent(item.content);
              setIsEditing(true);
            }}
            onDelete={(e) => handleDelete(item.id, e)}
          />
        ))}
      </div>

      <ContentDialog
        selectedContent={selectedContent}
        isEditing={isEditing}
        editedContent={editedContent}
        onClose={() => {
          setSelectedContent(null);
          setIsEditing(false);
          setEditedContent("");
        }}
        onEdit={handleEdit}
        onSave={handleSave}
        onCancelEdit={handleCancelEdit}
        onDelete={handleDelete}
        setEditedContent={setEditedContent}
      />
    </>
  );
};

export default ContentList;