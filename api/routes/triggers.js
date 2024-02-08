const express = require('express')
const router = express.Router()
const triggers = require('../controllers/triggers')

router.route('/triggers/count/all').get(triggers.count)
router.route('/triggers/count/24h').get(triggers.count24h)
router.route('/triggers/aggregate/24h').get(triggers.aggregate24h)
router.route('/triggers/has/24h').get(triggers.hasSentLast24h)

module.exports = router
