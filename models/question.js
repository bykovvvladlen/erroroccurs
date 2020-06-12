const mongoose = require('mongoose');
const question = new mongoose.Schema({
  owner: String,
  created: Date,
  title: String,
  body: String
});

module.exports = mongoose.model('question', question);
