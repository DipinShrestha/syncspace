'use client';

import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { updateCard } from '@/lib/api';
import toast from 'react-hot-toast';

interface CardCodeModalProps {
  card: any;
  onClose: () => void;
  onUpdate: () => void;
}

export default function CardCodeModal({ card, onClose, onUpdate }: CardCodeModalProps) {
  const [code, setCode] = useState<string>(card.code || '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateCard(card._id, { code });
      toast.success('Code saved');
      onUpdate();
      onClose();
    } catch {
      toast.error('Failed to save code');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: formData,
      });
      const data = await res.json();
      await updateCard(card._id, { codeFileUrl: data.url });
      setCode((prev: string) => prev + `\n\n// File uploaded: ${data.url}\n`);
      toast.success('File uploaded');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-900 rounded-xl w-full max-w-4xl h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-700 flex justify-between">
          <h2 className="text-xl font-bold text-white">Code for: {card.title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>
        <div className="flex-1 p-4">
          <Editor
            height="100%"
            language="javascript"
            value={code}
            onChange={(value) => setCode(value || '')}
            theme="vs-dark"
            options={{ minimap: { enabled: false } }}
          />
        </div>
        <div className="p-4 border-t border-gray-700 flex justify-between">
          <div>
            <input type="file" onChange={handleFileUpload} disabled={uploading} className="text-gray-300" />
            {uploading && <span className="text-gray-400 ml-2">Uploading...</span>}
          </div>
          <button onClick={handleSave} disabled={saving} className="bg-blue-600 px-4 py-2 rounded text-white">
            {saving ? 'Saving...' : 'Save Code'}
          </button>
        </div>
      </div>
    </div>
  );
}