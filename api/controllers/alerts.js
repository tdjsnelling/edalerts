const request = require('request-promise')
const Alert = require('../schema/Alert')

module.exports = {
  create: async (req, res) => {
    if (
      req.body.commodity &&
      req.body.type &&
      req.body.trigger &&
      req.body.value &&
      req.body.value > 0 &&
      ((req.body.type === 'sell' && req.body.minDemand) ||
        (req.body.type === 'buy' && req.body.minSupply)) &&
      req.body.pad &&
      req.body.webhook &&
      req.body.webhook.startsWith('https://discordapp.com/api/webhooks/') &&
      req.body.token
    ) {
      try {
        let recaptcha = await request({
          uri: 'https://www.google.com/recaptcha/api/siteverify',
          method: 'post',
          form: {
            secret: '6LcaQLcZAAAAAHTHBY5SWiUJbl2eRgb50Sqnoz17',
            response: req.body.token,
          },
        })
        recaptcha = JSON.parse(recaptcha)

        if (recaptcha.success && recaptcha.score > 0.5) {
          const newAlert = new Alert({
            ...req.body,
            created: Date.now(),
          })
          await newAlert.save()

          await request({
            uri: req.body.webhook,
            method: 'post',
            json: {
              username: 'ED Alerts',
              avatar_url: 'https://edalerts.app/favicon.png',
              content: `Alert created successfully: ${req.body.commodity} ${
                req.body.type
              } ${req.body.trigger === 'above' ? '>' : '<'} ${
                req.body.value
              }. Click here to delete: https://edalerts.app/delete/${
                newAlert._id
              }`,
            },
          })
          res.send(newAlert._id)
        } else {
          res.status(401).send('reCAPTCHA failed')
        }
      } catch (err) {
        res.status(500).send(err.message)
      }
    } else {
      res.sendStatus(400)
    }
  },
  get: async (req, res) => {
    try {
      const alert = await Alert.findOne({ _id: req.params.id })
      if (alert) {
        res.send(alert)
      } else {
        res.sendStatus(404)
      }
    } catch (err) {
      res.status(500).send(err.message)
    }
  },
  delete: async (req, res) => {
    try {
      const del = await Alert.deleteOne({ _id: req.params.id })
      if (del.deletedCount > 0) {
        res.sendStatus(200)
      } else {
        res.sendStatus(404)
      }
    } catch (err) {
      res.status(500).send(err.message)
    }
  },
}
