// app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getWorkspaces, createWorkspace } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Workspace {
  _id: string;
  name: string;
  description: string;
  updatedAt: string;
  members: { user: { _id: string } }[];
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) fetchWorkspaces();
  }, [user, authLoading]);

  const fetchWorkspaces = async () => {
    try {
      const res = await getWorkspaces();
      setWorkspaces(res.data);
    } catch {
      toast.error('Failed to load workspaces');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newName.trim()) return toast.error('Name required');
    try {
      const res = await createWorkspace({ name: newName, description: newDesc });
      setWorkspaces([res.data, ...workspaces]);
      setShowModal(false);
      setNewName('');
      setNewDesc('');
      toast.success('Workspace created');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Creation failed');
    }
  };

  if (authLoading || loading) return <div className="p-8">Loading...</div>;

  return (
    <>
      {/* NAVBAR */}
      <nav className="glass-nav fixed top-0 left-0 w-full z-50">
        <div className="w-full px-8">
          <div className="flex justify-between items-center h-16">
            <div className="logo">
              <Link href="/dashboard">
                <img src="/Gemini_Generated_Image_wf220zwf220zwf22.png" alt="SyncSpace Logo" />
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden md:block text-gray-300">
                Welcome, {user?.name || 'User'}
              </span>
              <button className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-semibold">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* MAIN LAYOUT */}
      <div className="flex pt-16 min-h-screen">
        {/* SIDEBAR */}
        <aside className="hidden md:block w-64 m-4 p-6 glass rounded-3xl h-fit sticky top-24">
          <div className="mb-8">
            <p className="uppercase text-xs text-gray-400 mb-2 tracking-wider">
              Workspace
            </p>
            <h2 className="text-blue-400 font-semibold text-lg">
              My Workspace
            </h2>
          </div>
          <nav className="space-y-2">
            <Link href="/dashboard" className="sidebar-link active block px-4 py-3 rounded-xl">
              Dashboard
            </Link>
            <Link href="/dashboard/chat" className="sidebar-link block px-4 py-3 rounded-xl text-gray-300">
              Chat
            </Link>
            <Link href="/dashboard/boards" className="sidebar-link block px-4 py-3 rounded-xl text-gray-300">
              Boards
            </Link>
            <Link href="/dashboard/documents" className="sidebar-link block px-4 py-3 rounded-xl text-gray-300">
              Documents
            </Link>
            <Link href="/dashboard/analytics" className="sidebar-link block px-4 py-3 rounded-xl text-gray-300">
              Analytics
            </Link>
          </nav>
        </aside>

        {/* CONTENT */}
        <main className="flex-1 px-6 py-10">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 mb-10">
            <div>
              <h1 className="text-4xl font-bold mb-2">Your Workspaces</h1>
              <p className="text-gray-400 text-lg">
                Manage projects, boards, documents and team collaboration in one place.
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="glass-btn px-6 py-3 rounded-2xl text-white font-medium"
            >
              + New Workspace
            </button>
          </div>

          {/* WORKSPACE CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {workspaces.map((ws) => (
              <div
                key={ws._id}
                onClick={() => router.push(`/workspace/${ws._id}`)}
                className="glass card-hover rounded-3xl p-6 cursor-pointer"
              >
                <h3 className="text-xl font-semibold mb-2">{ws.name}</h3>
                <p className="text-gray-400 text-sm">{ws.description || 'No description'}</p>
                <div className="flex justify-between items-center mt-6">
                  <span className="text-sm text-gray-400">
                    Last active {new Date(ws.updatedAt).toLocaleDateString()}
                  </span>
                  <span className="bg-blue-500/15 text-blue-300 px-3 py-1 rounded-full text-sm">
                    {ws.members?.length || 1} Members
                  </span>
                </div>
              </div>
            ))}

            {/* Create new workspace card */}
            <div
              onClick={() => setShowModal(true)}
              className="glass card-hover rounded-3xl p-6 flex items-center justify-center cursor-pointer text-gray-400 hover:text-white"
            >
              + Create New Workspace
            </div>
          </div>
        </main>
      </div>

      {/* NEW WORKSPACE MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-black/80 backdrop-blur-md rounded-2xl p-6 w-96 border border-white/20">
            <h2 className="text-xl font-bold mb-4">Create Workspace</h2>
            <input
              type="text"
              placeholder="Workspace name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full border border-white/20 bg-transparent rounded-lg px-4 py-2 mb-3 text-white"
            />
            <textarea
              placeholder="Description (optional)"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full border border-white/20 bg-transparent rounded-lg px-4 py-2 mb-4 text-white"
              rows={2}
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg border border-white/20">
                Cancel
              </button>
              <button onClick={handleCreate} className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700">
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}