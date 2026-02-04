const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  id: String,
  question: { type: String, required: true },
  opa: { type: String, required: true },
  opb: { type: String, required: true },
  opc: { type: String, required: true },
  opd: { type: String, required: true },
  cop: { type: Number, required: true },
  exp: String,
  subject_name: String,
  topic_name: String
});

module.exports = mongoose.model('Question', questionSchema);