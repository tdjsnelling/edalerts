const express = require('express')
const router = express.Router()
const alerts = require('../controllers/alerts')

router.route('/alert').post(alerts.create)
router.route('/alert/:id').get(alerts.get)
router.route('/alert/:id').delete(alerts.delete)
router.route('/alert/webhook/:webhook').get(alerts.getByWebhook)
router.route('/count').get(alerts.count)

module.exports = router
