'use client';
import { useState } from 'react';
import { inviteMember } from '@/lib/api';
import toast from 'react-hot-toast';

interface InviteMemberProps {
  workspaceId: string;
}

export default function InviteMember({ workspaceId }: InviteMemberProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInvite = async () => {
    if (!email.trim()) return toast.error('Email required');
    setLoading(true);
    try {
      await inviteMember(workspaceId, email);
      toast.success(`Invitation sent to ${email}`);
      setEmail('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invitation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <input
        type="email"
        placeholder="Friend's email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border rounded-md px-3 py-1 text-sm"
      />
      <button
        onClick={handleInvite}
        disabled={loading}
        className="bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-700"
      >
        {loading ? 'Sending...' : 'Invite'}
      </button>
    </div>
  );
}