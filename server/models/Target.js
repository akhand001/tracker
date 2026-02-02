const mongoose = require('mongoose');

const targetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  targetDate: { type: Date, required: true }
});

// Ensure one target per subject per user
targetSchema.index({ userId: 1, subjectId: 1 }, { unique: true });

module.exports = mongoose.model('Target', targetSchema);