const mongoose = require('mongoose')

const Trigger = new mongoose.Schema({
  alert: mongoose.ObjectId,
  timestamp: Number,
})

module.exports = mongoose.model('trigger', Trigger)
