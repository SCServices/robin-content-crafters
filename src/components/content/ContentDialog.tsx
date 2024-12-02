import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Check, X, Copy, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { ContentEditor } from "./ContentEditor";
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
  const handleCopy = async () => {
    try {
      const contentElement = document.querySelector(`[data-dialog-rendered-content-id="${selectedContent?.id}"]`);
      if (!contentElement) {
        throw new Error("Content element not found");
      }

      // Process the text to maintain proper formatting
      const processText = (text: string) => {
        return text
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0)
          .join('\n\n');
      };

      const textContent = processText(contentElement.textContent || '');
      await navigator.clipboard.writeText(textContent);
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
              <article className="prose prose-lg prose-primary max-w-none">
                <div data-dialog-rendered-content-id={selectedContent?.id}>
                  <ReactMarkdown>{selectedContent.content}</ReactMarkdown>
                </div>
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
                        onClick={(e) => onDelete(selectedContent.id, e)}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
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