const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    dueDate: Date,
    labels: [String],
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    board: { type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true },
    position: { type: Number, default: 0 },
    code: { type: String, default: '' },          // code stored as string
    codeFileUrl: { type: String, default: '' },   // uploaded file URL
  },
  { timestamps: true }
);

module.exports = mongoose.model('Card', cardSchema);