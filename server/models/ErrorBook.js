const mongoose = require('mongoose');

const ErrorBookSchema = new mongoose.Schema({
  userId: { type: String, required: true, default: 'default_user_2028' },
  subject: { type: String, required: true },
  topic: { type: String, default: 'General' },
  questionStem: { type: String, required: true },
  
  // Error Classification
  errorCategory: { 
    type: String, 
    enum: ['SILLY', 'CONCEPTUAL', 'GUESS', 'TIME_MANAGEMENT'], 
    default: 'CONCEPTUAL' 
  },
  
  correctOption: { type: String, required: true },
  explanation: { type: String, default: '' },
  memoryHook: { type: String, default: '' }, // High-yield Mnemonic / Hook
  priority: { type: String, enum: ['HIGH', 'MEDIUM', 'LOW'], default: 'HIGH' },
  
  // Spaced Repetition Engine: Days
  repetitionStage: { type: Number, default: 0 }, 
  nextReviewDate: { 
    type: Date, 
    default: () => new Date(Date.now() + 1 * 24 * 60 * 60 * 1000) // Next day default
  },
  isResolved: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('ErrorBook', ErrorBookSchema);