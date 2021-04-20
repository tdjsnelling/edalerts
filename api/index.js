const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const chalk = require('chalk')
const mongoose = require('mongoose')
const dotenv = require('dotenv')

dotenv.config()

const alertRoutes = require('./routes/alerts')
const triggerRoutes = require('./routes/triggers')

require('./listen')

const connectToDb = () => {
  console.log('initiating db connection...')
  mongoose
    .connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    })
    .catch((e) => {
      console.error(`error on initial db connection: ${e.message}`)
      setTimeout(connectToDb, 5000)
    })
}
connectToDb()

mongoose.connection.once('open', () => {
  console.log('connected to mongodb successfully')
})

const colorizeStatus = (status) => {
  if (!status) return '?'
  if (status.startsWith('2')) {
    return chalk.green(status)
  } else if (status.startsWith('4') || status.startsWith('5')) {
    return chalk.red(status)
  } else {
    return chalk.cyan(status)
  }
}

app.use(
  morgan((tokens, req, res) => {
    return [
      chalk.grey(new Date().toISOString()),
      chalk.yellow(tokens.method(req, res)),
      tokens.url(req, res),
      colorizeStatus(tokens.status(req, res)),
      `(${tokens['response-time'](req, res)} ms)`,
    ].join(' ')
  })
)

app.use(bodyParser.json())
app.use(cors())

app.use(alertRoutes)
app.use(triggerRoutes)

app.get('', (req, res) => {
  res.sendStatus(200)
})

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`edalerts API running on port ${PORT}`)
})
