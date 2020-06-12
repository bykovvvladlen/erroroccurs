const mongoose = require('mongoose');
const vote = new mongoose.Schema({
  target: String,
  owner: String,
  good: Boolean
});

module.exports = mongoose.model('vote', vote);
