const mongoose = require('mongoose');
const user = new mongoose.Schema({
  login: String,
  email: String,
  password: String,
  description: String,
  role: String,
  location: String,
  telegram: String,
  registration: Date
});

module.exports = mongoose.model('user', user);
