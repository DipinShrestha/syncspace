'use client';
import { useEffect, useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { updateDocument } from '@/lib/api';
import toast from 'react-hot-toast';

interface DocumentEditorProps {
  document: { _id: string; title: string; content: string };
  onUpdate: (updated: { _id: string; title: string; content: string }) => void;
}

export default function DocumentEditor({ document, onUpdate }: DocumentEditorProps) {
  const [title, setTitle] = useState(document.title);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const editor = useEditor({
    extensions: [StarterKit, Underline, TextAlign.configure({ types: ['heading', 'paragraph'] }), Placeholder.configure({ placeholder: 'Start writing...' })],
    content: document.content ? JSON.parse(document.content) : '<p></p>',
    editorProps: { attributes: { class: 'prose prose-sm max-w-none focus:outline-none min-h-[400px] p-4' } },
  });

  const autoSave = useCallback(async (content: unknown) => {
    setSaving(true);
    try {
      await updateDocument(document._id, { content: JSON.stringify(content) });
      setLastSaved(new Date());
      onUpdate({ ...document, content: JSON.stringify(content) });
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  }, [document, onUpdate]);

  useEffect(() => {
    if (!editor) return;
    const handler = setTimeout(() => autoSave(editor.getJSON()), 3000);
    return () => clearTimeout(handler);
  }, [editor, autoSave]);

  const saveTitle = async () => {
    if (title === document.title) return;
    try {
      await updateDocument(document._id, { title });
      setLastSaved(new Date());
      onUpdate({ ...document, title });
      toast.success('Title saved');
    } catch {
      toast.error('Failed to save title');
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white rounded-lg shadow p-4">
      <div className="border-b pb-3 mb-3">
        <input type="text" value={title} onChange={e => setTitle(e.target.value)} onBlur={saveTitle} className="text-2xl font-bold w-full border-none focus:outline-none focus:ring-0 p-0" placeholder="Document title" />
        <div className="text-xs text-gray-400 mt-1">{saving ? 'Saving...' : lastSaved ? `Saved at ${lastSaved.toLocaleTimeString()}` : 'Auto-save enabled'}</div>
      </div>
      <div className="flex flex-wrap gap-1 border-b pb-2 mb-2">
        <button onClick={() => editor?.chain().focus().toggleBold().run()} className={`p-2 rounded ${editor?.isActive('bold') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}>Bold</button>
        <button onClick={() => editor?.chain().focus().toggleItalic().run()} className={`p-2 rounded ${editor?.isActive('italic') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}>Italic</button>
        <button onClick={() => editor?.chain().focus().toggleUnderline().run()} className={`p-2 rounded ${editor?.isActive('underline') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}>Underline</button>
        <button onClick={() => editor?.chain().focus().setTextAlign('left').run()} className="p-2 rounded hover:bg-gray-100">Left</button>
        <button onClick={() => editor?.chain().focus().setTextAlign('center').run()} className="p-2 rounded hover:bg-gray-100">Center</button>
        <button onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} className={`p-2 rounded ${editor?.isActive('heading', { level: 1 }) ? 'bg-gray-200' : 'hover:bg-gray-100'}`}>H1</button>
        <button onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} className={`p-2 rounded ${editor?.isActive('heading', { level: 2 }) ? 'bg-gray-200' : 'hover:bg-gray-100'}`}>H2</button>
        <button onClick={() => editor?.chain().focus().toggleBulletList().run()} className={`p-2 rounded ${editor?.isActive('bulletList') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}>Bullet List</button>
        <button onClick={() => editor?.chain().focus().toggleOrderedList().run()} className={`p-2 rounded ${editor?.isActive('orderedList') ? 'bg-gray-200' : 'hover:bg-gray-100'}`}>Numbered List</button>
      </div>
      <EditorContent editor={editor} className="flex-1 min-h-[400px]" />
    </div>
  );
}