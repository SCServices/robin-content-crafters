import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Check, X, Copy, Pencil, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { useRef } from "react";
import { ContentEditor } from "./ContentEditor";
import { marked } from 'marked';

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
        // Use marked.parse with explicit string return type
        const htmlContent = String(marked.parseInline(selectedContent.content));
        
        // Create a temporary div to hold the HTML content
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        
        // Process the HTML content to create a clean, formatted text version
        const formattedText = Array.from(tempDiv.children).map(element => {
          const tag = element.tagName.toLowerCase();
          const text = element.textContent?.trim() || '';
          
          switch (tag) {
            case 'h1':
              return `# ${text}\n\n`;
            case 'h2':
              return `## ${text}\n\n`;
            case 'h3':
              return `### ${text}\n\n`;
            case 'p':
              return `${text}\n\n`;
            case 'ul':
              return Array.from(element.children)
                .map(li => {
                  const listText = li.textContent?.trim() || '';
                  // Check if the list item contains a bold section (for headers)
                  const boldMatch = listText.match(/^([^:]+):(.*)/);
                  if (boldMatch) {
                    return `- **${boldMatch[1].trim()}:**${boldMatch[2].trim()}\n`;
                  }
                  return `- ${listText}\n`;
                })
                .join('') + '\n';
            default:
              return `${text}\n\n`;
          }
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