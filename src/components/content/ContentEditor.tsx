import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { marked } from 'marked';
import TurndownService from 'turndown';
import { Link2, Italic } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from 'react';

interface ContentEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export const ContentEditor = ({ content, onChange }: ContentEditorProps) => {
  const [url, setUrl] = useState<string>('');
  
  // Convert markdown to HTML for initial editor content
  const htmlContent = marked.parse(content);
  const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced'
  });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: false
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false
        }
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline'
        }
      })
    ],
    content: htmlContent,
    editorProps: {
      attributes: {
        class: 'prose prose-lg prose-primary max-w-none min-h-[400px] focus:outline-none p-4',
      },
    },
    onUpdate: ({ editor }) => {
      // Convert HTML back to markdown when content changes
      const markdown = turndownService.turndown(editor.getHTML());
      onChange(markdown);
    },
  });

  const setLink = () => {
    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    setUrl('');
  };

  return (
    <div className="border rounded-lg bg-white">
      <div className="border-b p-2 flex gap-2 sticky top-0 bg-white z-10">
        <button
          onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded ${editor?.isActive('heading', { level: 1 }) ? 'bg-primary/10' : 'hover:bg-neutral-100'}`}
        >
          H1
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded ${editor?.isActive('heading', { level: 2 }) ? 'bg-primary/10' : 'hover:bg-neutral-100'}`}
        >
          H2
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-2 rounded ${editor?.isActive('heading', { level: 3 }) ? 'bg-primary/10' : 'hover:bg-neutral-100'}`}
        >
          H3
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded ${editor?.isActive('bulletList') ? 'bg-primary/10' : 'hover:bg-neutral-100'}`}
        >
          • List
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={`p-2 rounded ${editor?.isActive('bold') ? 'bg-primary/10' : 'hover:bg-neutral-100'}`}
        >
          B
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={`p-2 rounded ${editor?.isActive('italic') ? 'bg-primary/10' : 'hover:bg-neutral-100'}`}
        >
          <Italic className="h-4 w-4" />
        </button>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={`p-2 h-auto ${editor?.isActive('link') ? 'bg-primary/10' : 'hover:bg-neutral-100'}`}
            >
              <Link2 className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="Paste link"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1"
              />
              <Button onClick={setLink}>Add Link</Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
};