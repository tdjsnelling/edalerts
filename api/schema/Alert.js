const mongoose = require('mongoose')
const dotenv = require('dotenv')

dotenv.config()

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
  reconnectTries: Number.MAX_VALUE,
  reconnectInterval: 1000,
})

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
