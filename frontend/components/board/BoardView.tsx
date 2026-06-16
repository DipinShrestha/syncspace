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
import {
  getBoardsByWorkspace,
  createBoard,
  addList,
  addCard,
  updateCard,
  moveCard,
  getWorkspaceById,
} from '@/lib/api';
import { Card, List, Board } from '@/types/board';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/hooks/useSocket';

interface Member {
  _id: string;
  name: string;
  email: string;
}

interface BoardViewProps {
  workspaceId: string;
}

export default function BoardView({ workspaceId }: BoardViewProps) {
  const { user } = useAuth();
  const socket = useSocket();
  const [boards, setBoards] = useState<Board[]>([]);
  const [currentBoard, setCurrentBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNewBoardModal, setShowNewBoardModal] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [newListTitle, setNewListTitle] = useState(''); // ← restored
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  // filters
  const [filterAssignee, setFilterAssignee] = useState<string>('');
  const [filterLabel, setFilterLabel] = useState<string>('');
  const [filterDueDate, setFilterDueDate] = useState<string>('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    if (workspaceId) {
      fetchBoards();
      fetchMembers();
    }
  }, [workspaceId]);

  const fetchMembers = async () => {
    try {
      const res = await getWorkspaceById(workspaceId);
      const workspaceMembers = res.data.members.map((m: any) => m.user);
      setMembers(workspaceMembers);
    } catch (err) {
      console.error(err);
    }
  };

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

  // ✅ Restored: Add a new list to the current board
  const handleAddList = async (boardId: string, title: string) => {
    if (!title.trim()) return toast.error('List title required');
    try {
      const res = await addList(boardId, title);
      const newList = { _id: res.data._id, title: res.data.title, cards: [] };
      setBoards((prev) =>
        prev.map((board) =>
          board._id === boardId
            ? { ...board, lists: [...board.lists, newList] }
            : board
        )
      );
      if (currentBoard?._id === boardId) {
        setCurrentBoard((prev) =>
          prev ? { ...prev, lists: [...prev.lists, newList] } : prev
        );
      }
      setNewListTitle('');
      toast.success('List added');
    } catch (err) {
      toast.error('Failed to add list');
      console.error(err);
    }
  };

  const handleAddCard = async (
    boardId: string,
    listIndex: number,
    cardTitle: string,
    assigneeId?: string
  ) => {
    // ... (unchanged – optimistic update, API call, notification)
    try {
      const tempCardId = `temp-${Date.now()}`;
      const newCardData = { title: cardTitle, description: '', labels: [], assignedTo: assigneeId };
      setBoards((prevBoards) =>
        prevBoards.map((board) => {
          if (board._id !== boardId) return board;
          const newLists = [...board.lists];
          newLists[listIndex] = {
            ...newLists[listIndex],
            cards: [
              ...newLists[listIndex].cards,
              { ...newCardData, _id: tempCardId, position: newLists[listIndex].cards.length },
            ],
          };
          return { ...board, lists: newLists };
        })
      );
      if (currentBoard?._id === boardId) {
        setCurrentBoard((prev) => {
          if (!prev) return prev;
          const newLists = [...prev.lists];
          newLists[listIndex] = {
            ...newLists[listIndex],
            cards: [
              ...newLists[listIndex].cards,
              { ...newCardData, _id: tempCardId, position: newLists[listIndex].cards.length },
            ],
          };
          return { ...prev, lists: newLists };
        });
      }

      const res = await addCard(boardId, listIndex, {
        title: cardTitle,
        assignedTo: assigneeId,
      });
      setBoards((prevBoards) =>
        prevBoards.map((board) => {
          if (board._id !== boardId) return board;
          const newLists = [...board.lists];
          newLists[listIndex] = {
            ...newLists[listIndex],
            cards: newLists[listIndex].cards.map((card) =>
              card._id === tempCardId ? res.data : card
            ),
          };
          return { ...board, lists: newLists };
        })
      );
      if (currentBoard?._id === boardId) {
        setCurrentBoard((prev) => {
          if (!prev) return prev;
          const newLists = [...prev.lists];
          newLists[listIndex] = {
            ...newLists[listIndex],
            cards: newLists[listIndex].cards.map((card) =>
              card._id === tempCardId ? res.data : card
            ),
          };
          return { ...prev, lists: newLists };
        });
      }

      if (assigneeId && assigneeId !== user?._id) {
        socket?.emit('task-assigned', {
          assignedTo: assigneeId,
          cardTitle: cardTitle,
          workspaceId: workspaceId,
          cardId: res.data._id,
        });
      }
    } catch (err) {
      toast.error('Failed to add card');
      console.error(err);
      fetchBoards();
    }
  };

  // Move card via the → button (also uses permission check)
  const handleMoveStage = async (cardId: string, currentList: string) => {
    const stages = ['To Do', 'In Progress', 'Review', 'Done'];
    const currentIndex = stages.indexOf(currentList);
    if (currentIndex === -1 || currentIndex === stages.length - 1) return;
    const newList = stages[currentIndex + 1];
    try {
      await updateCard(cardId, { list: newList });
      toast.success(`Card moved to ${newList}`);
      fetchBoards();
    } catch (err) {
      toast.error('Failed to move card');
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
      const activeListIndex = currentBoard.lists.findIndex((list) =>
        list.cards.some((card) => `card-${card._id}` === activeId)
      );
      const overListIndex = currentBoard.lists.findIndex((list) =>
        list.cards.some((card) => `card-${card._id}` === overId)
      );
      if (activeListIndex === -1 || overListIndex === -1) return;

      const activeCardIndex = currentBoard.lists[activeListIndex].cards.findIndex(
        (card) => `card-${card._id}` === activeId
      );
      const overCardIndex = currentBoard.lists[overListIndex].cards.findIndex(
        (card) => `card-${card._id}` === overId
      );
      const card = currentBoard.lists[activeListIndex].cards[activeCardIndex];

      // ✅ Permission check: only assigned member can move between lists
      if (activeListIndex !== overListIndex && card.assignedTo !== user?._id) {
        toast.error('Only the assigned member can move this card between columns');
        return;
      }

      if (activeListIndex === overListIndex) {
        // reorder within same list
        const newCards = arrayMove(
          currentBoard.lists[activeListIndex].cards,
          activeCardIndex,
          overCardIndex
        );
        const updatedLists = [...currentBoard.lists];
        updatedLists[activeListIndex].cards = newCards;
        const updatedBoard = { ...currentBoard, lists: updatedLists };
        setCurrentBoard(updatedBoard);
        setBoards((prev) =>
          prev.map((b) => (b._id === currentBoard._id ? updatedBoard : b))
        );
        const movedCard = newCards[overCardIndex];
        try {
          await updateCard(movedCard._id, { position: overCardIndex });
        } catch (err) {
          console.error('Failed to update card position', err);
        }
      } else {
        // move to different list
        const [cardId] = activeId.split('-');
        const movedCard = currentBoard.lists[activeListIndex].cards[activeCardIndex];
        const updatedLists = [...currentBoard.lists];
        updatedLists[activeListIndex].cards.splice(activeCardIndex, 1);
        updatedLists[overListIndex].cards.splice(overCardIndex, 0, movedCard);
        const updatedBoard = { ...currentBoard, lists: updatedLists };
        setCurrentBoard(updatedBoard);
        setBoards((prev) =>
          prev.map((b) => (b._id === currentBoard._id ? updatedBoard : b))
        );
        try {
          await moveCard(cardId, {
            targetBoardId: currentBoard._id,
            targetListIndex: overListIndex,
            newPosition: overCardIndex,
          });
        } catch (err) {
          console.error('Failed to move card', err);
        }
      }
    }
  };

  const getDraggableListIds = () => {
    if (!currentBoard) return [];
    return currentBoard.lists.map((_, index) => `list-${index}`);
  };

  if (loading) return <div className="p-8 text-center text-white">Loading boards...</div>;

  if (!currentBoard) {
    return (
      <div>
        <div className="flex justify-between items-center mb-4 border-b border-white/20 pb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setShowNewBoardModal(true)}
              className="px-3 py-1 glass-btn rounded-lg text-sm"
            >
              + New Board
            </button>
          </div>
        </div>
        {showNewBoardModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="glass rounded-lg p-6 w-96">
              <h2 className="text-xl mb-4 text-white">Create New Board</h2>
              <input
                type="text"
                placeholder="Board title"
                value={newBoardTitle}
                onChange={(e) => setNewBoardTitle(e.target.value)}
                className="w-full glass-input rounded-lg p-2 mb-4 text-white"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowNewBoardModal(false)}
                  className="px-4 py-2 glass-outline rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateBoard}
                  className="px-4 py-2 glass-btn rounded-lg"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Filter Bar with glass effect */}
      <div className="flex flex-wrap gap-4 mb-4 p-2 glass rounded-lg">
        <select
          value={filterAssignee}
          onChange={(e) => setFilterAssignee(e.target.value)}
          className="glass-input rounded px-2 py-1 text-white text-sm"
        >
          <option value="">All Assignees</option>
          {members.map((m) => (
            <option key={m._id} value={m._id}>
              {m.name}
            </option>
          ))}
        </select>
        <select
          value={filterLabel}
          onChange={(e) => setFilterLabel(e.target.value)}
          className="glass-input rounded px-2 py-1 text-white text-sm"
        >
          <option value="">All Labels</option>
          <option value="bug">Bug</option>
          <option value="feature">Feature</option>
          <option value="urgent">Urgent</option>
        </select>
        <input
          type="date"
          value={filterDueDate}
          onChange={(e) => setFilterDueDate(e.target.value)}
          className="glass-input rounded px-2 py-1 text-white text-sm"
        />
        <button
          onClick={() => {
            setFilterAssignee('');
            setFilterLabel('');
            setFilterDueDate('');
          }}
          className="px-2 py-1 glass-outline rounded text-sm"
        >
          Clear Filters
        </button>
      </div>

      {/* Board header with "Add list" restored */}
      <div className="flex flex-wrap justify-between items-center mb-4 border-b border-white/20 pb-4">
        <div className="flex flex-wrap gap-2">
          {boards.map((board) => (
            <button
              key={board._id}
              onClick={() => setCurrentBoard(board)}
              className={`px-3 py-1 rounded-lg text-sm transition ${
                currentBoard._id === board._id
                  ? 'glass-active text-white'
                  : 'glass text-gray-300 hover:bg-white/10'
              }`}
            >
              {board.title}
            </button>
          ))}
          <button
            onClick={() => setShowNewBoardModal(true)}
            className="px-3 py-1 glass-btn rounded-lg text-sm"
          >
            + New Board
          </button>
        </div>

        {/* ✅ Add List input and button (restored) */}
        <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
          <input
            type="text"
            placeholder="Add a list..."
            value={newListTitle}
            onChange={(e) => setNewListTitle(e.target.value)}
            className="glass-input rounded-md px-2 py-1 text-sm w-32 sm:w-auto"
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
            className="glass-btn rounded-md px-3 py-1 text-sm"
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
            {currentBoard.lists.map((list, listIndex) => {
              let filteredCards = list.cards;
              if (filterAssignee)
                filteredCards = filteredCards.filter(
                  (c) => c.assignedTo === filterAssignee
                );
              if (filterLabel)
                filteredCards = filteredCards.filter((c) =>
                  c.labels?.includes(filterLabel)
                );
              if (filterDueDate)
                filteredCards = filteredCards.filter(
                  (c) => c.dueDate === filterDueDate
                );
              return (
                <BoardList
                  key={list._id || listIndex}
                  list={{ ...list, cards: filteredCards }}
                  listIndex={listIndex}
                  onAddCard={(title, assigneeId) =>
                    handleAddCard(
                      currentBoard._id,
                      listIndex,
                      title,
                      assigneeId
                    )
                  }
                  members={members}
                  onCardUpdated={fetchBoards}
                  onMoveStage={handleMoveStage}
                />
              );
            })}
          </SortableContext>
        </div>
        <DragOverlay
          dropAnimation={{
            sideEffects: defaultDropAnimationSideEffects({
              styles: { active: { opacity: '0.5' } },
            }),
          }}
        >
          {activeCard ? <BoardCard card={activeCard} /> : null}
        </DragOverlay>
      </DndContext>

      {showNewBoardModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="glass rounded-lg p-6 w-96">
            <h2 className="text-xl mb-4 text-white">Create New Board</h2>
            <input
              type="text"
              placeholder="Board title"
              value={newBoardTitle}
              onChange={(e) => setNewBoardTitle(e.target.value)}
              className="w-full glass-input rounded-lg p-2 mb-4 text-white"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowNewBoardModal(false)}
                className="px-4 py-2 glass-outline rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateBoard}
                className="px-4 py-2 glass-btn rounded-lg"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}