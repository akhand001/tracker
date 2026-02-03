const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: String,
  op_a: String,
  op_b: String,
  op_c: String,
  op_d: String,
  cop: Number,
  exp: String,
  subject_name: String
});

module.exports = mongoose.model('Question', questionSchema);