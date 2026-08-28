const mongoose = require('mongoose');

const TopicSchema = new mongoose.Schema({
  name: { type: String, required: true },
  isHighYield: { type: Boolean, default: false },
  hasPYQ: { type: Boolean, default: false },
  subtopics: [String]
});

const SubjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Pre-Clinical', 'Para-Clinical', 'Clinical'], 
    required: true 
  },
  order: { type: Number, required: true },
  topics: [TopicSchema]
});

module.exports = mongoose.model('Subject', SubjectSchema);