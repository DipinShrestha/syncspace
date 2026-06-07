'use client';
import React, { useState } from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import BoardCard from './BoardCard';
import { List } from '@/types/board';

interface Member {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface BoardListProps {
  list: List;
  listIndex: number;
  onAddCard: (title: string, assigneeId?: string) => void;
  members?: Member[];
}

const BoardList: React.FC<BoardListProps> = ({ list, listIndex, onAddCard, members = [] }) => {
  const [newCardTitle, setNewCardTitle] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('');
  const [isAddingCard, setIsAddingCard] = useState(false);

  const handleAddCard = () => {
    if (newCardTitle.trim()) {
      onAddCard(newCardTitle, selectedAssignee || undefined);
      setNewCardTitle('');
      setSelectedAssignee('');
      setIsAddingCard(false);
    }
  };

  return (
    <div className="bg-gray-100 rounded-md p-3 w-80 flex-shrink-0 flex flex-col max-h-full">
      <h3 className="font-semibold text-gray-700 mb-3 px-1">{list.title}</h3>
      <div className="flex-grow overflow-y-auto space-y-2 min-h-[2rem]">
        <SortableContext items={list.cards.map(card => `card-${card._id}`)} strategy={verticalListSortingStrategy}>
          {list.cards.map((card) => (
            <BoardCard key={card._id} card={card} />
          ))}
        </SortableContext>
      </div>
      {isAddingCard ? (
        <div className="mt-3">
          <input
            type="text"
            value={newCardTitle}
            onChange={(e) => setNewCardTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddCard()}
            placeholder="Enter card title..."
            className="w-full p-2 border rounded-md text-sm mb-2"
            autoFocus
          />
          {members.length > 0 && (
            <select
              value={selectedAssignee}
              onChange={(e) => setSelectedAssignee(e.target.value)}
              className="w-full p-2 border rounded-md text-sm mb-2 bg-white"
            >
              <option value="">Unassigned</option>
              {members.map(m => (
                <option key={m._id} value={m._id}>{m.name}</option>
              ))}
            </select>
          )}
          <div className="flex space-x-2">
            <button type="button" onClick={handleAddCard} className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700">Add</button>
            <button onClick={() => setIsAddingCard(false)} className="text-gray-500 hover:text-gray-700">Cancel</button>
          </div>
        </div>
      ) : (
        // Only show the "+ Add a card" button for the "To Do" column
        list.title === 'To Do' && (
          <button onClick={() => setIsAddingCard(true)} className="mt-3 text-gray-500 hover:text-gray-700 text-sm text-left w-full">
            + Add a card
          </button>
        )
      )}
    </div>
  );
};

export default BoardList;