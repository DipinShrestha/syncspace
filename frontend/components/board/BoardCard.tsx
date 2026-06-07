'use client';

import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/types/board';
import { deleteCard } from '@/lib/api';
import toast from 'react-hot-toast';
import CardCodeModal from './CardCodeModal';
import TaskDetailsModal from './TaskDetailsModal';

interface BoardCardProps {
  card: Card;
  members?: { _id: string; name: string }[];
  onCardUpdated?: () => void;
}

const BoardCard: React.FC<BoardCardProps> = ({ card, members = [], onCardUpdated }) => {
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

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
        toast.error('Delete failed');
      }
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
        onClick={() => setShowCodeModal(true)}   // click card → code modal
      >
        <p className="text-sm font-medium text-gray-800 pr-12">{card.title}</p>
        {card.assignedTo && (
          <div className="mt-1 text-xs text-gray-500">👤 Assigned</div>
        )}
        <div className="absolute top-2 right-2 flex gap-1">
          {/* Edit icon (metadata) */}
          <button
            onClick={(e) => { e.stopPropagation(); setShowEditModal(true); }}
            className="text-gray-400 hover:text-white text-xs"
            title="Edit task details"
          >
            ✎
          </button>
          {/* Delete icon */}
          <button
            onClick={handleDelete}
            className="text-gray-400 hover:text-red-500 text-xs"
            title="Delete card"
          >
            ✕
          </button>
        </div>
      </div>

      {showCodeModal && (
        <CardCodeModal
          card={card}
          onClose={() => setShowCodeModal(false)}
          onUpdate={onCardUpdated || (() => {})}
        />
      )}

      {showEditModal && (
        <TaskDetailsModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          card={card}
          members={members}
          onCardUpdated={onCardUpdated || (() => {})}
        />
      )}
    </>
  );
};

export default BoardCard;