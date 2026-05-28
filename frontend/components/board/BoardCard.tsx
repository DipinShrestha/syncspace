// components/board/BoardCard.tsx
'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/types/board';

interface BoardCardProps {
  card: Card;
}

const BoardCard: React.FC<BoardCardProps> = ({ card }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `card-${card._id}`,
    data: { type: 'card', card },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white p-3 rounded-md shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing hover:bg-gray-50"
    >
      <p className="text-sm font-medium text-gray-800">{card.title}</p>
      {card.assignedTo && (
        <div className="mt-2 text-xs text-gray-500">
          👤 Assigned
        </div>
      )}
    </div>
  );
};

export default BoardCard;