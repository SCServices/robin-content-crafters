import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Check, X, Copy, Pencil, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { useRef } from "react";
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
  const contentRef = useRef<HTMLDivElement>(null);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (contentRef.current) {
        const htmlContent = contentRef.current.innerHTML;
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        
        const formattedText = Array.from(tempDiv.children).map(element => {
          if (element.tagName === 'H1') {
            return `# ${element.textContent}\n\n`;
          }
          if (element.tagName === 'H2') {
            return `## ${element.textContent}\n\n`;
          }
          if (element.tagName === 'H3') {
            return `### ${element.textContent}\n\n`;
          }
          if (element.tagName === 'P') {
            let text = element.textContent || '';
            return `${text}\n\n`;
          }
          if (element.tagName === 'UL') {
            return Array.from(element.children)
              .map(li => {
                const text = li.textContent || '';
                const colonIndex = text.indexOf(':');
                if (colonIndex !== -1) {
                  const header = text.substring(0, colonIndex + 1);
                  const content = text.substring(colonIndex + 1);
                  return `- **${header}**${content}\n`;
                }
                return `- ${text}\n`;
              })
              .join('') + '\n';
          }
          return element.textContent + '\n\n';
        }).join('');

        await navigator.clipboard.writeText(formattedText.trim());
        toast.success("Content copied to clipboard");
      }
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
              <>
                <div ref={contentRef} className="hidden">
                  <ReactMarkdown>{selectedContent.content}</ReactMarkdown>
                </div>
                <article className="prose prose-lg prose-primary max-w-none">
                  <ReactMarkdown>{selectedContent.content}</ReactMarkdown>
                </article>
              </>
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
                  onClick={handleCopy}
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