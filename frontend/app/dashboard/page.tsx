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
  members?: { user: { _id: string } }[];
  owner?: string;
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

  if (authLoading || loading) return <div className="p-8 text-white">Loading...</div>;

  return (
    <>
      {/* Navbar */}
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

      {/* Main Content */}
      <div className="pt-16 px-4 pb-8 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <h1 className="text-2xl font-bold text-white">Your Workspaces</h1>
          <button
            onClick={() => setShowModal(true)}
            className="glass-btn px-4 py-2 rounded-lg text-sm"
          >
            + New Workspace
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspaces.map((ws) => (
            <div
              key={ws._id}
              onClick={() => router.push(`/workspace/${ws._id}`)}
              className="glass p-4 rounded-xl cursor-pointer hover:scale-[1.02] transition"
            >
              <h2 className="text-lg font-semibold text-white">{ws.name}</h2>
              <p className="text-sm text-gray-400">{ws.description || 'No description'}</p>
              <div className="flex justify-between items-center mt-3 text-xs text-gray-400">
                <span>{new Date(ws.updatedAt).toLocaleDateString()}</span>
                <span>{ws.members?.length || 1} members</span>
              </div>
              {ws.owner === user?._id && (
                <span className="text-xs text-blue-400 mt-2 inline-block">(Owner)</span>
              )}
            </div>
          ))}
          <div
            onClick={() => setShowModal(true)}
            className="glass p-4 rounded-xl flex items-center justify-center cursor-pointer text-gray-400 hover:text-white"
          >
            + Create Workspace
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-white">Create Workspace</h2>
            <input
              type="text"
              placeholder="Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full border border-gray-700 bg-gray-800 rounded-lg p-2 mb-3 text-white"
            />
            <textarea
              placeholder="Description (optional)"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full border border-gray-700 bg-gray-800 rounded-lg p-2 mb-4 text-white"
              rows={2}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-600 rounded-lg text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-blue-600 rounded-lg text-white"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}