// app/workspace/[id]/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getWorkspaces } from '@/lib/api';
import toast from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import InviteMember from '@/components/InviteMember';
import WorkspaceSidebar from '@/components/WorkspaceSidebar';
import BoardView from '@/components/board/BoardView';
import Chat from '@/components/chat/Chat';
import DocumentList from '@/components/documents/DocumentList';
import DocumentEditor from '@/components/documents/DocumentEditor';
import VideoCall from '@/components/VideoCall';
import Analytics from '@/components/Analytics';
import LiveCodeEditor from '@/components/LiveCodeEditor';

interface Workspace {
  _id: string;
  name: string;
  description: string;
}

interface Document {
  _id: string;
  title: string;
  content: string;
  updatedAt?: string;
}

export default function WorkspacePage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'boards' | 'documents' | 'chat' | 'analytics' | 'code'>('boards');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

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

  if (authLoading || loading) return <div className="p-8 text-white">Loading workspace...</div>;
  if (!workspace) return null;

  return (
    <>
      <Navbar />
      <div className="pt-16 min-h-screen bg-gray-900">
        <div className="flex h-[calc(100vh-4rem)]">
          <WorkspaceSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          <div className="flex-1 overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-white">{workspace.name}</h1>
                  <p className="text-gray-400">{workspace.description || 'No description'}</p>
                </div>
                <InviteMember workspaceId={id as string} />
              </div>

              {activeTab === 'boards' && <BoardView workspaceId={id as string} />}
              {activeTab === 'documents' && (
                <div className="flex flex-col md:flex-row gap-4 h-[70vh]">
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
              {activeTab === 'chat' && (
                <div className="space-y-6">
                  <Chat workspaceId={id as string} />
                  <div className="border-t border-gray-700 pt-6">
                    <h3 className="text-lg font-semibold text-white mb-3">Video Call</h3>
                    <VideoCall roomId={id as string} userId={user?._id as string} />
                  </div>
                </div>
              )}
              {activeTab === 'analytics' && <Analytics workspaceId={id as string} />}
              {activeTab === 'code' && <LiveCodeEditor />}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}