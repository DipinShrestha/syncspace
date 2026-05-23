
// app/workspace/[id]/page.tsx
'use client';
import BoardView from '@/components/board/BoardView';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getWorkspaces } from '@/lib/api';
import toast from 'react-hot-toast';

interface Workspace {
  _id: string;
  name: string;
  description: string;
}

export default function WorkspacePage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'boards' | 'documents' | 'chat'>('boards');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user && id) {
      fetchWorkspace();
    }
  }, [user, authLoading, id]);

  const fetchWorkspace = async () => {
    try {
      const res = await getWorkspaces(); // get all, then find by id (or create a dedicated endpoint later)
      const found = res.data.find((ws: Workspace) => ws._id === id);
      if (found) {
        setWorkspace(found);
      } else {
        toast.error('Workspace not found');
        router.push('/dashboard');
      }
    } catch (err) {
      toast.error('Failed to load workspace');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) return <div className="p-8">Loading workspace...</div>;
  if (!workspace) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold">{workspace.name}</h1>
          <p className="text-gray-600">{workspace.description || 'No description'}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('boards')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'boards'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Boards
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'documents'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Documents
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'chat'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Chat
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'boards' && <BoardView workspaceId={id as string} />}
        {activeTab === 'documents' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Documents</h2>
            <p className="text-gray-500">Document list and editor will be added here.</p>
          </div>
        )}
        {activeTab === 'chat' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Chat</h2>
            <p className="text-gray-500">Real‑time chat will be added here.</p>
          </div>
        )}
      </div>
    </div>
  );
}