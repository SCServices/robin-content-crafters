import { Button } from "@/components/ui/button";
import { Copy, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { useRef } from "react";
import { marked } from 'marked';
import TurndownService from 'turndown';

interface ContentActionsProps {
  content: string;
  onEdit: (content: string) => void;
  onDelete: (e: React.MouseEvent) => void;
}

export const ContentActions = ({ content, onEdit, onDelete }: ContentActionsProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced'
  });

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (contentRef.current) {
        // First convert markdown to HTML using marked
        const htmlContent = marked.parse(content);
        
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