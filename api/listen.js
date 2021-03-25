const zlib = require('zlib')
const zmq = require('zeromq')
const request = require('request-promise')
const WebSocket = require('ws')
const Alert = require('./schema/Alert')
const Trigger = require('./schema/Trigger')
const stations = require('./stations.json')
const commodityData = require('./commodities.json')
const rareCommodityData = require('./rarecommodities.json')

const wss = new WebSocket.Server({ port: process.env.WSPORT || 3002 })

const sendAlert = async ({
  alertId,
  alertValue,
  commodityName,
  type,
  trigger,
  value,
  station,
  system,
  supply,
  demand,
  maxPadSize,
  stationType,
  distance,
  planetary,
  webhookUrl,
  freq,
}) => {
  if (freq > 0) {
    await Alert.findOneAndUpdate(
      { _id: alertId },
      { $set: { lastSent: Date.now() } }
    )
  }

  const [commodity] = commodityData
    .concat(rareCommodityData)
    .filter((com) => com.symbol.toLowerCase() === commodityName.toLowerCase())

  const title = `ALERT: ${commodity ? commodity.name : commodityName} ${type} ${
    trigger === 'above' ? '>' : '<'
  } ${alertValue}`

  try {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(
          `${commodity ? commodity.name : commodityName} ${type} ${
            trigger === 'above' ? '>' : '<'
          } ${alertValue} (${station}, ${system})`
        )
      }
    })

    if (!process.env.DISABLE_WEBHOOKS) {
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
                  name: 'Location',
                  value: `${station}, ${system} ${
                    planetary ? '(planetary)' : ''
                  }`,
                  inline: false,
                },
                {
                  name: 'Value',
                  value: value.toLocaleString(),
                  inline: true,
                },
                {
                  name: 'Supply',
                  value: supply.toLocaleString(),
                  inline: true,
                },
                {
                  name: 'Demand',
                  value: demand.toLocaleString(),
                  inline: true,
                },
                {
                  name: 'Station type',
                  value: stationType,
                  inline: true,
                },
                {
                  name: 'Max. pad size',
                  value: maxPadSize,
                  inline: true,
                },
                {
                  name: 'Distance from star',
                  value: distance,
                  inline: true,
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

    const newTrigger = new Trigger({
      alert: alertId,
      timestamp: Date.now(),
    })
    await newTrigger.save()

    console.log(`sent alert ${alertId} successfully`)
  } catch (e) {
    if (e && e.message) {
      const {
        error: { message },
      } = e

      if (message === 'Unknown Webhook') {
        await Alert.deleteOne({ _id: alertId })
        console.log(`deleted alert ${alertId} due to removed webhook`)
      } else {
        console.error(`webhook failed for alert ${alertId}: ${message}`)
      }
    } else {
      console.error(`webhook failed for alert ${alertId}: unknown error`)
    }
  }
}

//
;(async () => {
  const sock = new zmq.Subscriber()
  sock.connect('tcp://eddn.edcd.io:9500')
  console.log('listener: worker connected to eddn.edcd.io:9500')

  sock.subscribe('')

  for await (const [topic] of sock) {
    const inflated = JSON.parse(zlib.inflateSync(topic))
    if (inflated['$schemaRef'] === 'https://eddn.edcd.io/schemas/commodity/3') {
      const [station] = stations.filter(
        (st) => st.name === inflated.message.stationName
      )
      const planetary = station ? station.is_planetary : false
      const fleetCarrier = /^[a-z0-9]{3}-[a-z0-9]{3}$/i.test(
        inflated.message.stationName
      )
      const stationType = fleetCarrier
        ? 'Fleet Carrier'
        : station
        ? station.type
        : 'unknown'
      const maxPadSize = station ? station.max_landing_pad_size : 'unknown'
      const distance =
        station && station.distance_to_star
          ? `${station.distance_to_star.toLocaleString()} Ls`
          : 'unknown'

      const commodities = inflated.message.commodities
      for (const commodity of commodities) {
        try {
          const alerts = await Alert.find({ commodity: commodity.name })
          for (const alert of alerts) {
            if (
              alert.freq === 0 ||
              (alert.freq > 0 && Date.now() > alert.lastSent + alert.freq)
            ) {
              if (
                alert.pad === 'any' ||
                (alert.pad === 'l' && maxPadSize === 'L') ||
                maxPadSize === 'unknown'
              ) {
                if (
                  ((planetary && alert.includePlanetary) || !planetary) &&
                  ((fleetCarrier && alert.includeFleetCarrier) || !fleetCarrier)
                ) {
                  if (
                    alert.type === 'buy' &&
                    commodity.buyPrice !== 0 &&
                    commodity.stock > alert.minSupply
                  ) {
                    if (
                      alert.trigger === 'above' &&
                      commodity.buyPrice > alert.value
                    ) {
                      await sendAlert({
                        alertId: alert._id,
                        alertValue: alert.value,
                        commodityName: commodity.name,
                        type: 'buy',
                        trigger: 'above',
                        value: commodity.buyPrice,
                        station: inflated.message.stationName,
                        system: inflated.message.systemName,
                        demand: commodity.demand,
                        supply: commodity.stock,
                        maxPadSize,
                        stationType,
                        distance,
                        planetary,
                        webhookUrl: alert.webhook,
                        freq: alert.freq,
                      })
                    } else if (
                      alert.trigger === 'below' &&
                      commodity.buyPrice < alert.value
                    ) {
                      await sendAlert({
                        alertId: alert._id,
                        alertValue: alert.value,
                        commodityName: commodity.name,
                        type: 'buy',
                        trigger: 'below',
                        value: commodity.buyPrice,
                        station: inflated.message.stationName,
                        system: inflated.message.systemName,
                        demand: commodity.demand,
                        supply: commodity.stock,
                        maxPadSize,
                        stationType,
                        distance,
                        planetary,
                        webhookUrl: alert.webhook,
                        freq: alert.freq,
                      })
                    }
                  } else if (
                    alert.type === 'sell' &&
                    commodity.sellPrice !== 0 &&
                    commodity.demand > alert.minDemand
                  ) {
                    if (
                      alert.trigger === 'above' &&
                      commodity.sellPrice > alert.value
                    ) {
                      await sendAlert({
                        alertId: alert._id,
                        alertValue: alert.value,
                        commodityName: commodity.name,
                        type: 'sell',
                        trigger: 'above',
                        value: commodity.sellPrice,
                        station: inflated.message.stationName,
                        system: inflated.message.systemName,
                        demand: commodity.demand,
                        supply: commodity.stock,
                        maxPadSize,
                        stationType,
                        distance,
                        planetary,
                        webhookUrl: alert.webhook,
                        freq: alert.freq,
                      })
                    } else if (
                      alert.trigger === 'below' &&
                      commodity.sellPrice < alert.value
                    ) {
                      await sendAlert({
                        alertId: alert._id,
                        alertValue: alert.value,
                        commodityName: commodity.name,
                        type: 'sell',
                        trigger: 'below',
                        value: commodity.sellPrice,
                        station: inflated.message.stationName,
                        system: inflated.message.systemName,
                        demand: commodity.demand,
                        supply: commodity.stock,
                        maxPadSize,
                        stationType,
                        distance,
                        planetary,
                        webhookUrl: alert.webhook,
                        freq: alert.freq,
                      })
                    }
                  }
                }
              }
            }
          }
        } catch (e) {
          if (e && e.message)
            console.error(`error handling alert: ${e.message}`)
          else console.error('error handling alert: unknown')
        }
      }
    }
  }
})()
