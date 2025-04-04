const zlib = require('zlib')
const zmq = require('zeromq')
const request = require('request-promise')
const dotenv = require('dotenv')

dotenv.config()

const Alert = require('./schema/Alert')
const Trigger = require('./schema/Trigger')
const stations = require('./stations.json')
const commodityData = require('./commodities.json')
const rareCommodityData = require('./rarecommodities.json')
const mongoose = require('mongoose')

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

mongoose.connection.once('open', async () => {
  console.log('connected to mongodb successfully')
  await listen()
})

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
  discordUser,
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

  console.log(`-> ${title}`)

  try {
    if (!process.env.DISABLE_WEBHOOKS) {
      await request({
        uri: webhookUrl,
        method: 'post',
        json: {
          username: 'ED Alerts',
          avatar_url: `${process.env.SITE_URL}/favicon.png`,
          content: discordUser ? `<@${discordUser}>` : undefined,
          embeds: [
            {
              title: title,
              color: 16284416,
              timestamp: new Date().toISOString(),
              author: {
                name: 'ED Alerts',
                url: process.env.SITE_URL,
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
                  value: `${process.env.SITE_URL}/delete/${alertId}`,
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

      const newTrigger = new Trigger({
        alert: alertId,
        timestamp: Date.now(),
      })
      await newTrigger.save()

      console.log(`sent alert ${alertId} successfully`)
    }
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

const listen = async () => {
  const sock = zmq.socket('sub')
  sock.connect('tcp://eddn.edcd.io:9500')
  sock.subscribe('')

  console.log('zmq connected to tcp://eddn.edcd.io:9500')

  sock.on('message', async (topic) => {
    const inflated = JSON.parse(zlib.inflateSync(topic))
    if (inflated['$schemaRef'] === 'https://eddn.edcd.io/schemas/commodity/3') {
      console.log(inflated.message.timestamp, 'eddn commodity message received')

      const fleetCarrier = /^[a-z0-9]{3}-[a-z0-9]{3}$/i.test(
        inflated.message.stationName
      )

      let station = stations.find(
        (st) =>
          st.name === inflated.message.stationName &&
          (st.system_name && !fleetCarrier
            ? st.system_name === inflated.message.systemName
            : true)
      )

      const planetary = station ? station.is_planetary : false
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
          const alerts = await Alert.find({
            commodity: commodity.name,
          }).maxTimeMS(2000)
          if (alerts.length > 0)
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
                    ((fleetCarrier && alert.includeFleetCarrier) ||
                      !fleetCarrier)
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
                          discordUser: alert.discordUser,
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
                          discordUser: alert.discordUser,
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
                          discordUser: alert.discordUser,
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
                          discordUser: alert.discordUser,
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
  })
}
