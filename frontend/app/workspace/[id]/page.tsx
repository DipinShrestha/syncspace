// app/workspace/[id]/page.tsx
'use client';
import BoardView from '@/components/board/BoardView';
import Chat from '@/components/chat/Chat';
import DocumentList from '@/components/documents/DocumentList';
import DocumentEditor from '@/components/documents/DocumentEditor';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getWorkspaces } from '@/lib/api';
import toast from 'react-hot-toast';
import Navbar from '@/components/Navbar';

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
  const [selectedDocument, setSelectedDocument] = useState<any>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user && id) fetchWorkspace();
  }, [user, authLoading, id]);

  const fetchWorkspace = async () => {
    try {
      const res = await getWorkspaces();
      const found = res.data.find((ws: Workspace) => ws._id === id);
      if (found) {
        setWorkspace(found);
      } else {
        toast.error('Workspace not found');
        router.push('/dashboard');
      }
    } catch {
      toast.error('Failed to load workspace');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) return <div className="p-8">Loading workspace...</div>;
  if (!workspace) return null;

  return (
    <>
      <Navbar />
      <div className="pt-16 min-h-screen bg-gray-50">
        {/* Workspace Header */}
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
            <div className="flex gap-4 h-[70vh]">
              <DocumentList
                workspaceId={id as string}
                onSelectDocument={setSelectedDocument}
                selectedDocId={selectedDocument?._id}
              />
              <div className="flex-1">
                {selectedDocument ? (
                  <DocumentEditor
                    document={selectedDocument}
                    onUpdate={(updated) => setSelectedDocument(updated)}
                  />
                ) : (
                  <div className="bg-white rounded-lg shadow p-8 text-center text-gray-400">
                    Select a document or create a new one
                  </div>
                )}
              </div>
            </div>
          )}
          {activeTab === 'chat' && <Chat workspaceId={id as string} />}
        </div>
      </div>
    </>
  );
}