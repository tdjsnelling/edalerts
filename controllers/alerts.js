const Alert = require('../schema/Alert')

module.exports = {
  create: async (req, res) => {
    if (
      req.body.commodity &&
      req.body.type &&
      req.body.trigger &&
      req.body.value &&
      req.body.webhook
    ) {
      try {
        const newAlert = new Alert({
          ...req.body,
          created: Date.now(),
        })
        await newAlert.save()
        res.send(newAlert._id)
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
      await Alert.deleteOne({ _id: req.params.id })
      res.sendStatus(200)
    } catch (err) {
      res.status(500).send(err.message)
    }
  },
}
