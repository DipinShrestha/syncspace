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
  onMoveStage?: (cardId: string, currentList: string) => void;
  currentListTitle?: string;
}

const getNextStage = (currentList: string): string | null => {
  const stages = ['To Do', 'In Progress', 'Review', 'Done'];
  const index = stages.indexOf(currentList);
  if (index === -1 || index === stages.length - 1) return null;
  return stages[index + 1];
};

const BoardCard: React.FC<BoardCardProps> = ({
  card,
  members = [],
  onCardUpdated,
  onMoveStage,
  currentListTitle = '',
}) => {
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

  const handleMoveStage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onMoveStage && currentListTitle) {
      onMoveStage(card._id, currentListTitle);
    }
  };

  const nextStage = getNextStage(currentListTitle);

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className="glass-card p-3 rounded-md shadow-sm cursor-grab active:cursor-grabbing hover:bg-white/20 relative" >
        {/* Drag handle – small area on the left */}
        <div
          {...attributes}
          {...listeners}
          className="absolute left-1 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
        >
          ⋮⋮
        </div>
        {/* Main content area – clickable */}
        <div
          className="ml-6 cursor-pointer"
          onClick={() => setShowCodeModal(true)}
        >
          <p className="text-sm font-medium text-gray-800 pr-12">{card.title}</p>
          {card.assignedTo && (
            <div className="mt-1 text-xs text-gray-500">👤 Assigned</div>
          )}
        </div>
        <div className="absolute top-2 right-2 flex gap-1">
          {nextStage && (
            <button
              onClick={handleMoveStage}
              className="text-gray-400 hover:text-green-500 text-xs"
              title={`Move to ${nextStage}`}
            >
              →
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); setShowEditModal(true); }}
            className="text-gray-400 hover:text-white text-xs"
            title="Edit task details"
          >
            ✎
          </button>
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