// components/board/BoardView.tsx
'use client';

import React, { useEffect, useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { arrayMove } from '@dnd-kit/sortable';
import BoardList from './BoardList';
import BoardCard from './BoardCard';
import { getBoardsByWorkspace, createBoard, addList, addCard, updateCard } from '@/lib/api';
import { Card, List, Board } from '@/types/board';
import toast from 'react-hot-toast';

interface BoardViewProps {
  workspaceId: string;
}

export default function BoardView({ workspaceId }: BoardViewProps) {
  const [boards, setBoards] = useState<Board[]>([]);
  const [currentBoard, setCurrentBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNewBoardModal, setShowNewBoardModal] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [newListTitle, setNewListTitle] = useState('');
  const [activeCard, setActiveCard] = useState<Card | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    if (workspaceId) {
      fetchBoards();
    }
  }, [workspaceId]);

  const fetchBoards = async () => {
    setLoading(true);
    try {
      const res = await getBoardsByWorkspace(workspaceId);
      setBoards(res.data);
      if (res.data.length > 0) setCurrentBoard(res.data[0]);
    } catch (err) {
      toast.error('Failed to load boards');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBoard = async () => {
    if (!newBoardTitle.trim()) return toast.error('Board title required');
    try {
      const res = await createBoard({ title: newBoardTitle, workspaceId });
      setBoards([...boards, res.data]);
      setCurrentBoard(res.data);
      setShowNewBoardModal(false);
      setNewBoardTitle('');
      toast.success('Board created');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Creation failed');
    }
  };

  const handleAddList = async (boardId: string, title: string) => {
    try {
      const res = await addList(boardId, title);
      // Create a new list object with the response data. MongoDB ID is in _id.
      const newList = { _id: res.data._id, title: res.data.title, cards: [] };
      // Update local state
      setBoards(prev =>
        prev.map(board =>
          board._id === boardId
            ? { ...board, lists: [...board.lists, newList] }
            : board
        )
      );
      if (currentBoard?._id === boardId) {
        setCurrentBoard(prev => prev ? { ...prev, lists: [...prev.lists, newList] } : prev);
      }
    } catch (err) {
      toast.error('Failed to add list');
      console.error(err);
    }
  };

  const handleAddCard = async (boardId: string, listIndex: number, cardTitle: string) => {
    try {
      const tempCardId = `temp-${Date.now()}`;
      const newCardData = { title: cardTitle, description: '', labels: [] };
      // Optimistically update the UI
      setBoards(prevBoards =>
        prevBoards.map(board => {
          if (board._id !== boardId) return board;
          const newLists = [...board.lists];
          newLists[listIndex] = {
            ...newLists[listIndex],
            cards: [...newLists[listIndex].cards, { ...newCardData, _id: tempCardId, position: newLists[listIndex].cards.length }],
          };
          return { ...board, lists: newLists };
        })
      );
      if (currentBoard?._id === boardId) {
        setCurrentBoard(prev => {
          if (!prev) return prev;
          const newLists = [...prev.lists];
          newLists[listIndex] = {
            ...newLists[listIndex],
            cards: [...newLists[listIndex].cards, { ...newCardData, _id: tempCardId, position: newLists[listIndex].cards.length }],
          };
          return { ...prev, lists: newLists };
        });
      }

      const res = await addCard(boardId, listIndex, { title: cardTitle });
      // Replace temp card with the one from the server
      setBoards(prevBoards =>
        prevBoards.map(board => {
          if (board._id !== boardId) return board;
          const newLists = [...board.lists];
          newLists[listIndex] = {
            ...newLists[listIndex],
            cards: newLists[listIndex].cards.map(card => card._id === tempCardId ? res.data : card),
          };
          return { ...board, lists: newLists };
        })
      );
      if (currentBoard?._id === boardId) {
        setCurrentBoard(prev => {
          if (!prev) return prev;
          const newLists = [...prev.lists];
          newLists[listIndex] = {
            ...newLists[listIndex],
            cards: newLists[listIndex].cards.map(card => card._id === tempCardId ? res.data : card),
          };
          return { ...prev, lists: newLists };
        });
      }
    } catch (err) {
      toast.error('Failed to add card');
      console.error(err);
      fetchBoards(); // Revert optimistic update by re-fetching
    }
  };

  const handleDragStart = (event: any) => {
    if (event.active.data.current?.type === 'card') {
      setActiveCard(event.active.data.current.card);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);

    if (!over) return;

    const activeId = active.id.toString();
    const overId = over.id.toString();
    if (!currentBoard) return;

    if (activeId.includes('card-') && overId.includes('card-')) {
      // Reorder cards in the same list
      const activeListIndex = currentBoard.lists.findIndex(list => list.cards.some(card => `card-${card._id}` === activeId));
      const overListIndex = currentBoard.lists.findIndex(list => list.cards.some(card => `card-${card._id}` === overId));
      if (activeListIndex === -1 || overListIndex === -1) return;

      const activeCardIndex = currentBoard.lists[activeListIndex].cards.findIndex(card => `card-${card._id}` === activeId);
      const overCardIndex = currentBoard.lists[overListIndex].cards.findIndex(card => `card-${card._id}` === overId);

      if (activeListIndex === overListIndex) {
        // Same list: reorder locally and then update positions on the backend.
        const newCards = arrayMove(currentBoard.lists[activeListIndex].cards, activeCardIndex, overCardIndex);
        const updatedLists = [...currentBoard.lists];
        updatedLists[activeListIndex].cards = newCards;
        const updatedBoard = { ...currentBoard, lists: updatedLists };
        setCurrentBoard(updatedBoard);
        setBoards(prev => prev.map(b => b._id === currentBoard._id ? updatedBoard : b));

        // Update positions on the backend (implement a batch update endpoint later).
        // For now, we'll just update the card's position individually.
        const movedCard = newCards[overCardIndex];
        try {
          await updateCard(movedCard._id, { position: overCardIndex });
        } catch (err) { console.error("Failed to update card position", err); }
      } else {
        // Different list: move the card to another list.
        const [cardId] = activeId.split('-');
        const movedCard = currentBoard.lists[activeListIndex].cards[activeCardIndex];
        const updatedLists = [...currentBoard.lists];
        updatedLists[activeListIndex].cards.splice(activeCardIndex, 1);
        updatedLists[overListIndex].cards.splice(overCardIndex, 0, movedCard);
        const updatedBoard = { ...currentBoard, lists: updatedLists };
        setCurrentBoard(updatedBoard);
        setBoards(prev => prev.map(b => b._id === currentBoard._id ? updatedBoard : b));

        // Call API to move the card to a new list and update its position.
        try {
          await updateCard(cardId, { boardId: currentBoard._id, targetListIndex: overListIndex, newPosition: overCardIndex });
        } catch (err) { console.error("Failed to move card", err); }
      }
    }
  };

  const getDraggableListIds = () => {
    if (!currentBoard) return [];
    return currentBoard.lists.map((_, index) => `list-${index}`);
  };

  if (loading) return <div className="p-8 text-center">Loading boards...</div>;
  if (!currentBoard) return <div className="p-8 text-center">No boards found. Create one to get started!</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4 border-b pb-4">
        <div className="flex gap-2">
          {boards.map(board => (
            <button
              key={board._id}
              onClick={() => setCurrentBoard(board)}
              className={`px-3 py-1 rounded ${
                currentBoard._id === board._id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {board.title}
            </button>
          ))}
          <button
            onClick={() => setShowNewBoardModal(true)}
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
          >
            + New Board
          </button>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add a list..."
            value={newListTitle}
            onChange={(e) => setNewListTitle(e.target.value)}
            className="border rounded-md px-2 py-1 text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newListTitle.trim()) {
                handleAddList(currentBoard._id, newListTitle);
                setNewListTitle('');
              }
            }}
          />
          <button
            onClick={() => {
              if (newListTitle.trim()) {
                handleAddList(currentBoard._id, newListTitle);
                setNewListTitle('');
              }
            }}
            className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm"
          >
            Add List
          </button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          <SortableContext
            items={getDraggableListIds()}
            strategy={horizontalListSortingStrategy}
          >
            {currentBoard.lists.map((list, listIndex) => (
              <BoardList
                key={list._id || listIndex}
                list={list}
                listIndex={listIndex}
               onAddCard={(title) => handleAddCard(currentBoard._id, listIndex, title)}
              />
            ))}
          </SortableContext>
        </div>
        <DragOverlay
          dropAnimation={{
            sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.5' } } }),
          }}
        >
          {activeCard ? <BoardCard card={activeCard} /> : null}
        </DragOverlay>
      </DndContext>

      {showNewBoardModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl mb-4">Create New Board</h2>
            <input
              type="text"
              placeholder="Board title"
              value={newBoardTitle}
              onChange={(e) => setNewBoardTitle(e.target.value)}
              className="w-full border rounded p-2 mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowNewBoardModal(false)} className="px-4 py-2 border rounded">Cancel</button>
              <button onClick={handleCreateBoard} className="px-4 py-2 bg-blue-600 text-white rounded">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}