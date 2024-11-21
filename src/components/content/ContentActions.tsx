import { Button } from "@/components/ui/button";
import { Copy, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { useRef } from "react";

interface ContentActionsProps {
  content: string;
  onEdit: (content: string) => void;
  onDelete: (e: React.MouseEvent) => void;
}

export const ContentActions = ({ content, onEdit, onDelete }: ContentActionsProps) => {
  const contentRef = useRef<HTMLDivElement>(null);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (contentRef.current) {
        // Get the HTML content and clean it
        const htmlContent = contentRef.current.innerHTML;
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        
        // Convert HTML to plain text while preserving formatting
        const formattedText = Array.from(tempDiv.children).map(element => {
          // Handle headings with proper sizing
          if (element.tagName === 'H1') {
            return `${element.textContent}\n\n`;
          }
          if (element.tagName === 'H2') {
            return `${element.textContent}\n\n`;
          }
          // Handle paragraphs with double spacing
          if (element.tagName === 'P') {
            let text = element.textContent || '';
            // Handle bold text
            element.querySelectorAll('strong').forEach(strong => {
              text = text.replace(strong.textContent || '', `${strong.textContent}`);
            });
            return `${text}\n\n`;
          }
          // Handle lists
          if (element.tagName === 'UL') {
            return Array.from(element.children)
              .map(li => `• ${li.textContent}\n`)
              .join('') + '\n';
          }
          return element.textContent + '\n\n';
        }).join('');

        await navigator.clipboard.writeText(formattedText.trim());
        toast.success("Content copied to clipboard");
      }
    } catch (error) {
      console.error("Copy error:", error);
      toast.error("Failed to copy content");
    }
  };

  return (
    <>
      <div ref={contentRef} className="hidden">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-primary/10"
          onClick={handleCopy}
        >
          <Copy className="h-4 w-4 text-primary hover:text-primary-dark" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-secondary/10"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(content);
          }}
        >
          <Pencil className="h-4 w-4 text-secondary hover:text-secondary-dark" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-destructive/10"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4 text-destructive hover:text-destructive/80" />
        </Button>
      </div>
    </>
  );
};