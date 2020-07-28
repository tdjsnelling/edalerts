const zlib = require('zlib')
const zmq = require('zeromq')
const sock = zmq.socket('sub')
const request = require('request-promise')
const Alert = require('./schema/Alert')

const sendAlert = async ({
  alertId,
  alertValue,
  commodityName,
  type,
  trigger,
  value,
  station,
  system,
  webhookUrl,
}) => {
  const title = `Alert triggered: ${commodityName} ${type} ${
    trigger === 'above' ? '>' : '<'
  } ${alertValue}`

  await request({
    uri: webhookUrl,
    method: 'post',
    json: {
      username: 'ED Alerts',
      avatar_url: 'https://edalerts.app/favicon.png',
      embeds: [
        {
          title: title,
          color: 16284416,
          timestamp: new Date().toISOString(),
          author: {
            name: 'ED Alerts',
            url: 'https://edalerts.app',
          },
          fields: [
            {
              name: 'Value',
              value: value,
              inline: false,
            },
            {
              name: 'Location',
              value: `${station}, ${system}`,
              inline: false,
            },
            {
              name: 'Delete this alert',
              value: `https://edalerts.app/delete/${alertId}`,
              inline: false,
            },
          ],
          footer: {
            text: 'ED Alerts',
          },
        },
      ],
    },
  })
}

sock.connect('tcp://eddn.edcd.io:9500')
console.log('listener: worker connected to eddn.edcd.io:9500')

sock.subscribe('')

sock.on('message', (message) => {
  const inflated = JSON.parse(zlib.inflateSync(message))
  if (inflated['$schemaRef'] === 'https://eddn.edcd.io/schemas/commodity/3') {
    const commodities = inflated.message.commodities
    commodities.forEach(async (commodity) => {
      const alerts = await Alert.find({ commodity: commodity.name })
      alerts.forEach(async (alert) => {
        if (alert.type === 'buy' && commodity.buyPrice !== 0) {
          if (alert.trigger === 'above') {
            if (commodity.buyPrice > alert.value) {
              sendAlert({
                alertId: alert._id,
                alertValue: alert.value,
                commodityName: commodity.name,
                type: 'buy',
                trigger: 'above',
                value: commodity.buyPrice,
                station: inflated.message.stationName,
                system: inflated.message.systemName,
                webhookUrl: alert.webhook,
              })
            }
          } else if (alert.trigger === 'below') {
            if (commodity.buyPrice < alert.value) {
              sendAlert({
                alertId: alert._id,
                alertValue: alert.value,
                commodityName: commodity.name,
                type: 'buy',
                trigger: 'below',
                value: commodity.buyPrice,
                station: inflated.message.stationName,
                system: inflated.message.systemName,
                webhookUrl: alert.webhook,
              })
            }
          }
        } else if (alert.type === 'sell' && commodity.sellPrice !== 0) {
          if (alert.trigger === 'above') {
            if (commodity.sellPrice > alert.value) {
              sendAlert({
                alertId: alert._id,
                alertValue: alert.value,
                commodityName: commodity.name,
                type: 'sell',
                trigger: 'above',
                value: commodity.sellPrice,
                station: inflated.message.stationName,
                system: inflated.message.systemName,
                webhookUrl: alert.webhook,
              })
            }
          } else if (alert.trigger === 'below') {
            if (commodity.sellPrice < alert.value) {
              sendAlert({
                alertId: alert._id,
                alertValue: alert.value,
                commodityName: commodity.name,
                type: 'sell',
                trigger: 'below',
                value: commodity.sellPrice,
                station: inflated.message.stationName,
                system: inflated.message.systemName,
                webhookUrl: alert.webhook,
              })
            }
          }
        }
      })
    })
  }
})
