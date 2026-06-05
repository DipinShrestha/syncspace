// app/dashboard/settings/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getWorkspaces, deleteWorkspace, removeWorkspaceMember } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import toast from 'react-hot-toast';

interface Workspace {
  _id: string;
  name: string;
  description: string;
  owner: string | { _id: string; name: string };
  members: { user: { _id: string; name: string; email: string }; role: string }[];
}

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);

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

  const getOwnerId = (ws: Workspace): string => {
    if (typeof ws.owner === 'string') return ws.owner;
    return ws.owner?._id || '';
  };

  const ownedWorkspaces = workspaces.filter(ws => getOwnerId(ws) === user?._id);

  const handleDeleteWorkspace = async (workspaceId: string) => {
    if (!confirm('Delete this workspace? This action cannot be undone.')) return;
    try {
      await deleteWorkspace(workspaceId);
      setWorkspaces(prev => prev.filter(ws => ws._id !== workspaceId));
      toast.success('Workspace deleted');
    } catch {
      toast.error('Failed to delete workspace');
    }
  };

  const handleRemoveMember = async (workspaceId: string, memberId: string, memberName: string) => {
    if (!confirm(`Remove ${memberName} from this workspace?`)) return;
    try {
      await removeWorkspaceMember(workspaceId, memberId);
      // Update local state
      setWorkspaces(prev =>
        prev.map(ws => {
          if (ws._id !== workspaceId) return ws;
          return {
            ...ws,
            members: ws.members.filter(m => m.user._id !== memberId),
          };
        })
      );
      toast.success(`Removed ${memberName} from workspace`);
    } catch {
      toast.error('Failed to remove member');
    }
  };

  if (authLoading || loading) return <div className="p-8">Loading...</div>;

  return (
    <>
      <Navbar />
      <div className="pt-20 px-4 pb-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Settings</h1>

        {/* Profile Section */}
        <div className="glass p-6 rounded-xl mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Profile Information</h2>
          <div className="space-y-2">
            <p><span className="text-gray-400">Name:</span> {user?.name}</p>
            <p><span className="text-gray-400">Email:</span> {user?.email}</p>
          </div>
        </div>

        {/* Workspaces Management */}
        <div className="glass p-6 rounded-xl">
          <h2 className="text-xl font-semibold text-white mb-4">Your Workspaces</h2>
          {ownedWorkspaces.length === 0 ? (
            <p className="text-gray-400">You don't own any workspaces.</p>
          ) : (
            <div className="space-y-6">
              {ownedWorkspaces.map(ws => (
                <div key={ws._id} className="border border-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{ws.name}</h3>
                      <p className="text-sm text-gray-400">{ws.description || 'No description'}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteWorkspace(ws._id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                    >
                      Delete Workspace
                    </button>
                  </div>
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Members</h4>
                    <ul className="space-y-2">
                      {ws.members.map(member => {
                        const memberId = typeof member.user === 'string' ? member.user : member.user._id;
                        const memberName = typeof member.user === 'string' ? memberId : member.user.name;
                        const isOwner = getOwnerId(ws) === memberId;
                        return (
                          <li key={memberId} className="flex justify-between items-center bg-gray-800 p-2 rounded">
                            <span className="text-sm text-gray-200">{memberName} {isOwner && '(Owner)'}</span>
                            {!isOwner && (
                              <button
                                onClick={() => handleRemoveMember(ws._id, memberId, memberName)}
                                className="text-red-400 hover:text-red-300 text-sm"
                              >
                                Remove
                              </button>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}