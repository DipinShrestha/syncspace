'use client';

import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/types/board';
import { updateCard, deleteCard } from '@/lib/api';
import toast from 'react-hot-toast';

interface BoardCardProps {
  card: Card;
  members?: { _id: string; name: string }[]; // for assignee dropdown in edit modal
  onCardUpdated?: () => void; // refresh parent after edit/delete
}

const BoardCard: React.FC<BoardCardProps> = ({ card, members = [], onCardUpdated }) => {
  const [showModal, setShowModal] = useState(false);
  const [editTitle, setEditTitle] = useState(card.title);
  const [editDescription, setEditDescription] = useState(card.description || '');
  const [editAssignee, setEditAssignee] = useState(card.assignedTo || '');

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `card-${card._id}`,
    data: { type: 'card', card },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this card?')) {
      try {
        await deleteCard(card._id);
        toast.success('Card deleted');
        onCardUpdated?.();
      } catch {
        toast.error('Failed to delete card');
      }
    }
  };

  const handleSave = async () => {
    try {
      await updateCard(card._id, {
        title: editTitle,
        description: editDescription,
        assignedTo: editAssignee || undefined,
      });
      toast.success('Card updated');
      setShowModal(false);
      onCardUpdated?.();
    } catch {
      toast.error('Failed to update card');
    }
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="bg-white p-3 rounded-md shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing hover:bg-gray-50 relative"
        onClick={() => setShowModal(true)}
      >
        <p className="text-sm font-medium text-gray-800 pr-6">{card.title}</p>
        {card.assignedTo && (
          <div className="mt-1 text-xs text-gray-500">👤 Assigned</div>
        )}
        <button
          onClick={handleDelete}
          className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-xs"
        >
          ✕
        </button>
      </div>

      {/* Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-lg p-6 w-96 max-w-full" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Edit Card</h2>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full border rounded p-2 mb-3"
              placeholder="Title"
            />
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full border rounded p-2 mb-3"
              rows={3}
              placeholder="Description"
            />
            {members.length > 0 && (
              <select
                value={editAssignee}
                onChange={(e) => setEditAssignee(e.target.value)}
                className="w-full border rounded p-2 mb-3"
              >
                <option value="">Unassigned</option>
                {members.map(m => (
                  <option key={m._id} value={m._id}>{m.name}</option>
                ))}
              </select>
            )}
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BoardCard;