const Trigger = require('../schema/Trigger')

module.exports = {
  count: async (req, res) => {
    try {
      const count = await Trigger.countDocuments({})
      res.send({ count })
    } catch (e) {
      res.status(500).send(e.message)
    }
  },
  count24h: async (req, res) => {
    try {
      const count = await Trigger.countDocuments({
        timestamp: { $gt: Date.now() - 8.64e7 },
      })
      res.send({ count })
    } catch (e) {
      res.status(500).send(e.message)
    }
  },
  aggregate24h: async (req, res) => {
    try {
      const triggers = await Trigger.aggregate([
        { $match: { timestamp: { $gt: Date.now() - 8.64e7 } } },
        {
          $group: {
            _id: {
              $dateToString: {
                date: {
                  $toDate: '$timestamp',
                },
                format: '%Y-%m-%d %H:00',
              },
            },
            count: {
              $sum: 1,
            },
          },
        },
        { $sort: { _id: 1 } },
      ])
      res.send(triggers)
    } catch (e) {
      res.status(500).send(e.message)
    }
  },
}
