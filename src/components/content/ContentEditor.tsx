import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { marked } from 'marked';
import TurndownService from 'turndown';

interface ContentEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export const ContentEditor = ({ content, onChange }: ContentEditorProps) => {
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

  return (
    <div className="border rounded-lg bg-white">
      <div className="border-b p-2 flex gap-2">
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
      </div>
      <EditorContent editor={editor} />
    </div>
  );
};