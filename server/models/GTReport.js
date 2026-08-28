const mongoose = require('mongoose');

const GTReportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  gtTitle: { type: String, required: true }, // e.g. "Marrow National Mock 1"
  testDate: { type: Date, default: Date.now },
  totalQuestions: { type: Number, default: 200 },
  correctCount: { type: Number, required: true },
  incorrectCount: { type: Number, required: true },
  unattemptedCount: { type: Number, default: 0 },
  score: { type: Number, required: true },
  percentile: { type: Number },
  sillyMistakesCount: { type: Number, default: 0 },
  conceptualMistakesCount: { type: Number, default: 0 },
  guessingMistakesCount: { type: Number, default: 0 },
  subjectPerformance: [{
    subject: String,
    correct: Number,
    incorrect: Number,
    accuracyPercentage: Number
  }],
  actionItemsForNextGT: [String]
}, { timestamps: true });

module.exports = mongoose.model('GTReport', GTReportSchema);