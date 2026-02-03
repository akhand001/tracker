const mongoose = require('mongoose'); // Is line ko sabse upar add karein

const questionSchema = new mongoose.Schema({
  id: String,
  question: String,
  opa: String,
  opb: String,
  opc: String,
  opd: String,
  cop: Number,
  exp: String,
  subject_name: String,
  topic_name: String
});

module.exports = mongoose.model('Question', questionSchema);