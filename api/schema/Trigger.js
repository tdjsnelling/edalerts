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

const Trigger = new mongoose.Schema({
  alert: mongoose.ObjectId,
  timestamp: Number,
})

module.exports = mongoose.model('trigger', Trigger)
