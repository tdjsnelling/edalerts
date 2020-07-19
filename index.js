const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const chalk = require('chalk')

const alertRoutes = require('./routes/alerts')

const colorizeStatus = (status) => {
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

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`edalerts API running on port ${PORT}`)
})
