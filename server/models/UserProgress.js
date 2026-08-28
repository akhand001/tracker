const mongoose = require('mongoose');

const TopicProgressSchema = new mongoose.Schema({
  topicName: { type: String, required: true },
  isHighYield: { type: Boolean, default: false },
  hasPYQ: { type: Boolean, default: false },
  
  // Core Tracking Checkboxes
  videosCompleted: { type: Boolean, default: false },
  notesCompleted: { type: Boolean, default: false },
  pyqCompleted: { type: Boolean, default: false },
  mcqsCompleted: { type: Boolean, default: false },
  
  // 3-Tier Revision Cycles
  revision1: { type: Boolean, default: false },
  revision2: { type: Boolean, default: false },
  revision3: { type: Boolean, default: false },
  
  // Status: 🟢 Completed, 🟡 In Progress, 🔴 Not Started, ⚠️ Weak
  status: { 
    type: String, 
    enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'WEAK'], 
    default: 'NOT_STARTED' 
  },
  isWeak: { type: Boolean, default: false },
  notes: { type: String, default: '' },
  lastStudied: { type: Date }
});

const UserProgressSchema = new mongoose.Schema({
  userId: { type: String, required: true, default: 'default_user_2028' },
  subjectName: { type: String, required: true },
  category: { type: String, required: true }, // Pre-Clinical, Para-Clinical, Clinical
  order: { type: Number },
  topics: [TopicProgressSchema]
}, { timestamps: true });

module.exports = mongoose.model('UserProgress', UserProgressSchema);