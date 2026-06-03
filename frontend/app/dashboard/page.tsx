// app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getWorkspaces, createWorkspace } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Navbar from '@/components/Navbar';

interface Workspace {
  _id: string;
  name: string;
  description: string;
  updatedAt: string;
  members: { user: { _id: string } }[];
  owner: string;
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

  const ownedWorkspaces = workspaces.filter(ws => ws.owner === user?._id);
  const memberWorkspaces = workspaces.filter(ws => ws.owner !== user?._id);

  return (
    <>
      <Navbar />
      <div className="pt-16 px-4 pb-8 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <button
            onClick={() => setShowModal(true)}
            className="glass-btn px-4 py-2 rounded-lg text-sm"
          >
            + New Workspace
          </button>
        </div>

        {/* Your Workspaces (owned) */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold text-white mb-4">Your Workspaces</h2>
          {ownedWorkspaces.length === 0 ? (
            <p className="text-gray-400">You haven't created any workspaces yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {ownedWorkspaces.map((ws) => (
                <div
                  key={ws._id}
                  onClick={() => router.push(`/workspace/${ws._id}`)}
                  className="glass p-4 rounded-xl cursor-pointer hover:scale-[1.02] transition"
                >
                  <h3 className="text-lg font-semibold text-white">{ws.name}</h3>
                  <p className="text-sm text-gray-400">{ws.description || 'No description'}</p>
                  <div className="flex justify-between items-center mt-3 text-xs text-gray-400">
                    <span>{new Date(ws.updatedAt).toLocaleDateString()}</span>
                    <span>{ws.members?.length || 1} members</span>
                  </div>
                  <span className="text-xs text-blue-400 mt-2 inline-block">(Owner)</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Workspaces You're a Member Of */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Workspaces You're a Member Of</h2>
          {memberWorkspaces.length === 0 ? (
            <p className="text-gray-400">You are not a member of any other workspaces.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {memberWorkspaces.map((ws) => (
                <div
                  key={ws._id}
                  onClick={() => router.push(`/workspace/${ws._id}`)}
                  className="glass p-4 rounded-xl cursor-pointer hover:scale-[1.02] transition"
                >
                  <h3 className="text-lg font-semibold text-white">{ws.name}</h3>
                  <p className="text-sm text-gray-400">{ws.description || 'No description'}</p>
                  <div className="flex justify-between items-center mt-3 text-xs text-gray-400">
                    <span>{new Date(ws.updatedAt).toLocaleDateString()}</span>
                    <span>{ws.members?.length || 1} members</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal (unchanged) */}
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
      </div>
    </>
  );
}