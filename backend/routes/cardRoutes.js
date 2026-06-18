// backend/routes/cardRoutes.js
const express        = require('express');
const { updateCard, deleteCard, moveCard } = require('../controllers/boardController');
const { protect }    = require('../middleware/authMiddleware');
const commentRoutes  = require('./commentRoutes');

const router = express.Router();

// PUT    /api/cards/:cardId
router.put('/:cardId', protect, updateCard);
// DELETE /api/cards/:cardId
router.delete('/:cardId', protect, deleteCard);
// PATCH  /api/cards/:cardId/move
router.patch('/:cardId/move', protect, moveCard);

// Nest comments under a card
// GET    /api/cards/:cardId/comments
// POST   /api/cards/:cardId/comments
// DELETE /api/cards/:cardId/comments/:commentId
router.use('/:cardId/comments', commentRoutes);

module.exports = router;