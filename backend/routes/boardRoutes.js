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
  updateCard,
  deleteCard,
  moveCard,
} = require('../controllers/boardController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Board routes
router.route('/')
  .post(protect, createBoard);
router.get('/workspace/:workspaceId', protect, getBoardsByWorkspace);
router.route('/:id')
  .get(protect, getBoardById)
  .put(protect, updateBoard)
  .delete(protect, deleteBoard);

// List routes
router.post('/:boardId/lists', protect, addList);
router.put('/:boardId/lists/:listIndex', protect, updateList);
router.delete('/:boardId/lists/:listIndex', protect, deleteList);

// Card routes (nested)
router.post('/:boardId/lists/:listIndex/cards', protect, addCard);
router.put('/cards/:cardId', protect, updateCard);
router.delete('/cards/:cardId', protect, deleteCard);
router.patch('/cards/:cardId/move', protect, moveCard);

module.exports = router;