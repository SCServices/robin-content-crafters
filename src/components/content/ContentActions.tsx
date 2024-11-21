import { Copy, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { marked } from 'marked';
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

interface ContentActionsProps {
  content: string;
  onEdit: (content: string) => void;
  onDelete: (e: React.MouseEvent) => void;
}

export const ContentActions = ({ content, onEdit, onDelete }: ContentActionsProps) => {
  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const htmlContent = String(marked.parseInline(content));
      
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      
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
    } catch (error) {
      toast.error("Failed to copy content");
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(content);
  };

  return (
    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <Button
        variant="ghost"
        size="sm"
        className="text-neutral-500 hover:text-primary hover:bg-primary/10"
        onClick={handleCopy}
      >
        <Copy className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="text-neutral-500 hover:text-secondary hover:bg-secondary/10"
        onClick={handleEdit}
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="text-neutral-500 hover:text-destructive hover:bg-destructive/10"
            onClick={(e) => e.stopPropagation()}
          >
            <Trash2 className="h-4 w-4" />
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
            <AlertDialogCancel onClick={(e) => e.stopPropagation()}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};