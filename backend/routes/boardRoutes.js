// backend/routes/boardRoutes.js
const express = require('express');
const {
  createBoard,
  getBoardsByWorkspace,
  getBoardById,
  updateBoard,
  deleteBoard,
  addList,
  updateList,
  deleteList,
  addCard,
} = require('../controllers/boardController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Board CRUD
router.route('/').post(protect, createBoard);
router.get('/workspace/:workspaceId', protect, getBoardsByWorkspace);
router.route('/:id')
  .get(protect, getBoardById)
  .put(protect, updateBoard)
  .delete(protect, deleteBoard);

// List operations
router.post('/:boardId/lists', protect, addList);
router.put('/:boardId/lists/:listIndex', protect, updateList);
router.delete('/:boardId/lists/:listIndex', protect, deleteList);

// Card creation (nested under a board+list — stays here because it needs boardId + listIndex)
router.post('/:boardId/lists/:listIndex/cards', protect, addCard);

// FIX: removed PUT/DELETE/PATCH /cards/:cardId from here —
// they were mounted at /api/boards/cards/:cardId but the frontend
// calls /api/cards/:cardId, causing permanent 404s.
// Those routes now live in cardRoutes.js mounted at /api/cards.

module.exports = router;