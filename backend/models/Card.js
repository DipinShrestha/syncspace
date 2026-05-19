const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    dueDate: Date,
    labels: [String], // e.g., ["bug", "feature", "urgent"]
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    board: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Board',
      required: true,
    },
    position: {
      type: Number,
      default: 0, // for ordering inside a list
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Card', cardSchema);