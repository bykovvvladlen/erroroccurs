const mongoose = require('mongoose');
const token = new mongoose.Schema({
  owner: String,
  token: String,
  expires: Date
});

module.exports = mongoose.model('token', token);
