const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topicId: { type: mongoose.Schema.Types.ObjectId, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'reading', 'revision', 'mastered'], 
    default: 'pending' 
  },
  revisionCount: { type: Number, default: 0 },
  isWeak: { type: Boolean, default: false },
  lastRevised: { type: Date }
});

// Index for fast lookups per user
ProgressSchema.index({ userId: 1, topicId: 1 }, { unique: true });

module.exports = mongoose.model('Progress', ProgressSchema);