const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost/edalerts', {
  useNewUrlParser: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
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
  created: Number,
})

module.exports = mongoose.model('alert', Alert)
