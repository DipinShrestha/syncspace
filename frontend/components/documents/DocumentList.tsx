'use client';

import { useEffect, useState, useCallback } from 'react';
import { getDocumentsByWorkspace, createDocument, deleteDocument } from '@/lib/api';
import toast from 'react-hot-toast';

interface Document {
  _id: string;
  title: string;
  content: string;
  updatedAt: string;
}

interface DocumentListProps {
  workspaceId: string;
  onSelectDocument: (doc: Document | null) => void;  // Allow null
  selectedDocId?: string;
}

export default function DocumentList({ workspaceId, onSelectDocument, selectedDocId }: DocumentListProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  // Wrap fetchDocuments in useCallback to avoid infinite re-renders
  const fetchDocuments = useCallback(async () => {
    try {
      const res = await getDocumentsByWorkspace(workspaceId);
      setDocuments(res.data);
    } catch (_err) {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  // Now useEffect depends on fetchDocuments (stable)
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleCreate = async () => {
    if (!newTitle.trim()) return toast.error('Title required');
    try {
      const res = await createDocument({
        title: newTitle,
        content: JSON.stringify({ type: 'doc', content: [{ type: 'paragraph' }] }),
        workspaceId,
      });
      setDocuments([res.data, ...documents]);
      onSelectDocument(res.data);
      setIsCreating(false);
      setNewTitle('');
      toast.success('Document created');
    } catch (_err) {
      toast.error('Creation failed');
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this document?')) {
      try {
        await deleteDocument(id);
        setDocuments(documents.filter(d => d._id !== id));
        if (selectedDocId === id) onSelectDocument(null); // No more "as any"
        toast.success('Document deleted');
      } catch (_err) {
        toast.error('Delete failed');
      }
    }
  };

  if (loading) return <div className="p-4">Loading documents...</div>;

  return (
    <div className="w-64 bg-white border-r p-2 overflow-y-auto h-full">
      <button
        onClick={() => setIsCreating(true)}
        className="w-full mb-3 bg-blue-600 text-white py-2 rounded-md text-sm hover:bg-blue-700"
      >
        + New Document
      </button>
      {isCreating && (
        <div className="mb-3 p-2 border rounded bg-gray-50">
          <input
            type="text"
            placeholder="Document title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full border rounded p-1 text-sm mb-2"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
          <div className="flex gap-2">
            <button onClick={handleCreate} className="bg-blue-600 text-white px-2 py-1 rounded text-xs">Create</button>
            <button onClick={() => setIsCreating(false)} className="border rounded px-2 py-1 text-xs">Cancel</button>
          </div>
        </div>
      )}
      <div className="space-y-1">
        {documents.map((doc) => (
          <div
            key={doc._id}
            onClick={() => onSelectDocument(doc)}
            className={`p-2 rounded cursor-pointer hover:bg-gray-100 flex justify-between items-center ${
              selectedDocId === doc._id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
            }`}
          >
            <div className="truncate flex-1">
              <div className="font-medium text-sm truncate">{doc.title}</div>
              <div className="text-xs text-gray-400">
                {new Date(doc.updatedAt).toLocaleDateString()}
              </div>
            </div>
            <button
              onClick={(e) => handleDelete(doc._id, e)}
              className="text-gray-400 hover:text-red-500 text-sm"
            >
              🗑️
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}