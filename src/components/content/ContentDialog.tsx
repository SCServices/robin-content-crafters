import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Edit, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { ContentEditor } from "./ContentEditor";

interface ContentDialogProps {
  selectedContent: any;
  isEditing: boolean;
  editedContent: string;
  onClose: () => void;
  onEdit: (content: string) => void;
  onSave: () => void;
  onCancelEdit: () => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  setEditedContent: (content: string) => void;
}

export const ContentDialog = ({
  selectedContent,
  isEditing,
  editedContent,
  onClose,
  onEdit,
  onSave,
  onCancelEdit,
  onDelete,
  setEditedContent,
}: ContentDialogProps) => {
  if (!selectedContent) return null;

  return (
    <Dialog open={!!selectedContent} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>{selectedContent.title}</DialogTitle>
          <div className="flex items-center gap-2">
            {!isEditing && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(selectedContent.content)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => onDelete(selectedContent.id, e)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="h-full pr-4">
          {isEditing ? (
            <div className="space-y-4">
              <ContentEditor
                content={editedContent}
                onChange={setEditedContent}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onCancelEdit}>
                  Cancel
                </Button>
                <Button onClick={onSave}>Save Changes</Button>
              </div>
            </div>
          ) : (
            <article className="prose prose-neutral prose-headings:text-primary prose-a:text-primary max-w-none">
              <ReactMarkdown>{selectedContent.content}</ReactMarkdown>
            </article>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};