import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "h

Let me check the codebase for all instances of copy functionality. I can see that there are two components that handle copying:

1. `src/components/content/ContentActions.tsx` (hover buttons in content list)
2. `src/components/content/ContentDialog.tsx` (copy button in preview modal)

Let's implement the text formatting requirements consistently across both components:

<lov-code>
First, let's update ContentActions.tsx:

<lov-write file_path="src/components/content/ContentActions.tsx">
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
        const htmlContent = contentRef.current.innerHTML;
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        
        const formattedText = Array.from(tempDiv.children).map(element => {
          // Handle headings with proper sizing
          if (element.tagName === 'H1') {
            return `${element.textContent}\n\n`;
          }
          if (element.tagName === 'H2') {
            return `${element.textContent}\n\n`;
          }
          if (element.tagName === 'H3') {
            return `${element.textContent}\n\n`;
          }
          // Handle paragraphs
          if (element.tagName === 'P') {
            let text = element.textContent || '';
            return `${text}\n\n`;
          }
          // Handle lists with bold headers before colons
          if (element.tagName === 'UL') {
            return Array.from(element.children)
              .map(li => {
                const text = li.textContent || '';
                const colonIndex = text.indexOf(':');
                if (colonIndex !== -1) {
                  const header = text.substring(0, colonIndex + 1);
                  const content = text.substring(colonIndex + 1);
                  return `• ${header}${content}\n`;
                }
                return `• ${text}\n`;
              })
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
      <div ref={contentRef} className="hidden prose prose-lg prose-primary max-w-none">
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