const mongoose = require('mongoose')

const Alert = new mongoose.Schema({
  commodity: String,
  type: String,
  trigger: String,
  value: Number,
  webhook: String,
  minSupply: Number,
  minDemand: Number,
  pad: String,
  includePlanetary: Boolean,
  includeFleetCarrier: Boolean,
  freq: Number,
  lastSent: Number,
  created: Number,
})

module.exports = mongoose.model('alert', Alert)
