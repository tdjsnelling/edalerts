const zlib = require('zlib')
const zmq = require('zeromq')
const sock = zmq.socket('sub')
const Alert = require('./schema/Alert')

const sendAlert = ({
  alertValue,
  commodityName,
  type,
  trigger,
  value,
  station,
  system,
}) => {
  console.log(
    `${new Date().toISOString()}: ${commodityName} ${
      type === 'buy' ? 'buys' : 'sells'
    } for ${
      trigger === 'above' ? 'more' : 'less'
    } than ${alertValue} at ${station} in the ${system} system. Current value is ${value}.`
  )
}

sock.connect('tcp://eddn.edcd.io:9500')
console.log('Worker connected to port 9500')

sock.subscribe('')

sock.on('message', (message) => {
  const inflated = JSON.parse(zlib.inflateSync(message))
  if (inflated['$schemaRef'] === 'https://eddn.edcd.io/schemas/commodity/3') {
    //console.log(JSON.stringify(inflated, null, 2))

    const commodities = inflated.message.commodities
    commodities.forEach(async (commodity) => {
      const alerts = await Alert.find({ commodity: commodity.name })
      alerts.forEach(async (alert) => {
        if (alert.type === 'buy' && commodity.buyPrice !== 0) {
          if (alert.trigger === 'above') {
            if (commodity.buyPrice > alert.value) {
              sendAlert({
                alertValue: alert.value,
                commodityName: commodity.name,
                type: 'buy',
                trigger: 'above',
                value: commodity.buyPrice,
                station: inflated.message.stationName,
                system: inflated.message.systemName,
              })
            }
          } else if (alert.trigger === 'below') {
            if (commodity.buyPrice < alert.value) {
              sendAlert({
                alertValue: alert.value,
                commodityName: commodity.name,
                type: 'buy',
                trigger: 'below',
                value: commodity.buyPrice,
                station: inflated.message.stationName,
                system: inflated.message.systemName,
              })
            }
          }
        } else if (alert.type === 'sell' && commodity.sellPrice !== 0) {
          if (alert.trigger === 'above') {
            if (commodity.sellPrice > alert.value) {
              sendAlert({
                alertValue: alert.value,
                commodityName: commodity.name,
                type: 'sell',
                trigger: 'above',
                value: commodity.sellPrice,
                station: inflated.message.stationName,
                system: inflated.message.systemName,
              })
            }
          } else if (alert.trigger === 'below') {
            if (commodity.sellPrice < alert.value) {
              sendAlert({
                alertValue: alert.value,
                commodityName: commodity.name,
                type: 'sell',
                trigger: 'below',
                value: commodity.sellPrice,
                station: inflated.message.stationName,
                system: inflated.message.systemName,
              })
            }
          }
        }
      })
    })
  }
})
