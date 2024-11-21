import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Check, X, Copy, Pencil, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

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
  const handleCopy = async (content: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(content);
      toast.success("Content copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy content");
    }
  };

  return (
    <Dialog open={!!selectedContent} onOpenChange={onClose}>
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
                  onClick={onSave}
                  className="bg-success hover:bg-success/90"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button
                  variant="outline"
                  onClick={onCancelEdit}
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
                  onClick={(e) => handleCopy(selectedContent.content, e)}
                  className="text-primary hover:bg-primary/10"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onEdit(selectedContent.content)}
                  className="text-secondary hover:bg-secondary/10"
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  onClick={(e) => onDelete(selectedContent.id, e)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </>
            )}
          </div>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};