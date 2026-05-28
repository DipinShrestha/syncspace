// frontend/types/board.ts
export interface Card {
  _id: string;
  title: string;
  description?: string;
  labels?: string[];
  dueDate?: string;
  assignedTo?: { _id: string; name: string };
  position: number;
}

export interface List {
  _id?: string;
  title: string;
  cards: Card[];
}

export interface Board {
  _id: string;
  title: string;
  lists: List[];
}