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
        const formattedText = contentRef.current.innerText;
        await navigator.clipboard.writeText(formattedText);
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