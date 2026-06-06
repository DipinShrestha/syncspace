// components/board/TaskDetailsModal.tsx
'use client';

import { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { updateCard } from '@/lib/api';
import toast from 'react-hot-toast';

interface Member {
  _id: string;
  name: string;
}

interface Card {
  _id: string;
  title: string;
  description?: string;
  dueDate?: string;
  labels?: string[];
  assignedTo?: string;
  code?: string;
}

interface TaskDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: Card;
  members: Member[];
  onCardUpdated: () => void;
}

export default function TaskDetailsModal({ isOpen, onClose, card, members, onCardUpdated }: TaskDetailsModalProps) {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || '');
  const [dueDate, setDueDate] = useState(card.dueDate || '');
  const [labels, setLabels] = useState(card.labels?.join(', ') || '');
  const [assignedTo, setAssignedTo] = useState(card.assignedTo || '');
  const [code, setCode] = useState(card.code || '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load code from card if exists
  useEffect(() => {
    if (card.code) setCode(card.code);
  }, [card]);

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
      setCode(prev => prev + `\n\n// File uploaded: ${data.url}\n`);
      toast.success('File uploaded');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateCard(card._id, {
        title,
        description,
        dueDate: dueDate || undefined,
        labels: labels.split(',').map(l => l.trim()),
        assignedTo: assignedTo || undefined,
        code: code,
      });
      toast.success('Card updated');
      onCardUpdated();
      onClose();
    } catch {
      toast.error('Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-900 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 space-y-4">
          <h2 className="text-xl font-bold text-white">Edit Task</h2>

          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white"
          />

          <textarea
            placeholder="Description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white"
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Labels (comma separated)</label>
              <input
                type="text"
                placeholder="bug, feature, urgent"
                value={labels}
                onChange={e => setLabels(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm text-gray-400 mb-1">Assign To</label>
              <select
                value={assignedTo}
                onChange={e => setAssignedTo(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white"
              >
                <option value="">Unassigned</option>
                {members.map(m => (
                  <option key={m._id} value={m._id}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Code (Monaco Editor)</label>
            <div className="border border-gray-700 rounded-lg overflow-hidden">
              <Editor
                height="300px"
                defaultLanguage="javascript"
                value={code}
                onChange={(val) => setCode(val || '')}
                theme="vs-dark"
                options={{ minimap: { enabled: false } }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Upload Code File</label>
            <input
              type="file"
              accept=".js,.py,.java,.cpp,.txt"
              onChange={handleFileUpload}
              disabled={uploading}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button onClick={onClose} className="px-4 py-2 border border-gray-600 rounded-lg text-gray-300">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-blue-600 rounded-lg text-white">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}