import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Check, X, Copy } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { ContentEditor } from "./ContentEditor";
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
  setEditedContent,
}: ContentDialogProps) => {
  const handleCopy = async () => {
    try {
      const contentElement = document.querySelector(`[data-dialog-content-id="${selectedContent?.id}"]`);
      if (!contentElement) {
        throw new Error("Content element not found");
      }

      const textContent = contentElement.textContent || "";
      await navigator.clipboard.writeText(textContent.trim());
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
              <ContentEditor
                content={editedContent}
                onChange={setEditedContent}
              />
            ) : (
              <article className="prose prose-lg prose-primary max-w-none" data-dialog-content-id={selectedContent?.id}>
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
                  onClick={() => onEdit(selectedContent.content)}
                  className="text-secondary hover:bg-secondary/10"
                >
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