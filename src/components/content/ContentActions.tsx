import { Copy, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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

interface ContentActionsProps {
  content: string;
  onEdit: (content: string) => void;
  onDelete: (e: React.MouseEvent) => void;
}

export const ContentActions = ({ content, onEdit, onDelete }: ContentActionsProps) => {
  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      // Process markdown content directly
      const formattedText = content
        .split('\n')
        .map(line => {
          // Handle headings
          if (line.startsWith('# ')) {
            return line.replace('# ', '') + '\n\n';
          }
          if (line.startsWith('## ')) {
            return line.replace('## ', '') + '\n\n';
          }
          // Handle bullet points
          if (line.startsWith('- ')) {
            return line + '\n';
          }
          // Handle regular paragraphs
          return line ? line + '\n\n' : '\n';
        })
        .join('')
        .trim();

      await navigator.clipboard.writeText(formattedText);
      toast.success("Content copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy content");
    }
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
        onClick={(e) => {
          e.stopPropagation();
          onEdit(content);
        }}
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