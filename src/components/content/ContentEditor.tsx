import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

interface ContentEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export const ContentEditor = ({ content, onChange }: ContentEditorProps) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    editorProps: {
      attributes: {
        class: 'prose prose-lg prose-primary max-w-none min-h-[400px] focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  return (
    <div className="border rounded-lg p-4 bg-white">
      <EditorContent editor={editor} />
    </div>
  );
};