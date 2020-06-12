const mongoose = require('mongoose');
const comment = new mongoose.Schema({
  target: String,
  owner: String,
  created: Date,
  body: String
});

module.exports = mongoose.model('comment', comment);
