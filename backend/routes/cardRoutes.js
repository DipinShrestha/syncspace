// backend/routes/cardRoutes.js
const express = require('express');
const {
  updateCard,
  deleteCard,
  moveCard,
} = require('../controllers/boardController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// PUT  /api/cards/:cardId        — update card fields (title, description, list, etc.)
router.put('/:cardId', protect, updateCard);

// DELETE /api/cards/:cardId      — delete a card
router.delete('/:cardId', protect, deleteCard);

// PATCH  /api/cards/:cardId/move — move card to a different list / position
router.patch('/:cardId/move', protect, moveCard);

module.exports = router;