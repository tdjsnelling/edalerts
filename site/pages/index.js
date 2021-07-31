import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import moment from 'moment'
import { Flex, Box, Heading, Text } from 'rebass/styled-components'
import styled from 'styled-components'
import css from '@styled-system/css'
import { createGlobalStyle } from 'styled-components'
import { Loader, HelpCircle, ErrorCircle } from '@styled-icons/boxicons-regular'
import Layout from '../components/Layout'
import Button from '../components/Button'
import Input from '../components/Input'
import Select from '../components/Select'
import Checkbox from '../components/Checkbox'

import commodities from '../commodities.json'
import rarecommodities from '../rarecommodities.json'

export const intervalOptions = {
  0: 'as they happen',
  10000: 'at most every 10 seconds',
  30000: 'at most every 30 seconds',
  60000: 'at most every 1 minute',
  120000: 'at most every 2 minutes',
  300000: 'at most every 5 minutes',
}

const RecaptchaStyle = createGlobalStyle`
  .grecaptcha-badge {
    display: none;
  }
`

const Divider = styled(Text)(() =>
  css({
    overflow: 'hidden',
    position: 'relative',
    '&::before, &::after': {
      content: '""',
      height: '1px',
      width: ['40%', '45%'],
      bg: 'grey',
      position: 'absolute',
      top: '50%',
    },
    '&::before': {
      left: 0,
    },
    '&::after': {
      right: 0,
    },
  })
)

const Index = () => {
  const [apiData, setApiData] = useState({})
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)
  const [showHelp, setShowHelp] = useState(false)
  const [alertType, setAlertType] = useState('sell')
  const [showLimitWarning, setShowLimitWarning] = useState(false)
  const [loading, setLoading] = useState(false)
  const [liveEvents, setLiveEvents] = useState([])
  const router = useRouter()

  useEffect(() => {
    ;(async () => {
      let backendStatus = false

      const statusRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}`)
      if (statusRes.ok) {
        backendStatus = true
      }

      const countRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/count`)
      const { count } = await countRes.json()

      const triggerCountRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/triggers/count/24h`
      )
      const { count: triggerCount } = await triggerCountRes.json()

      setApiData({ backendStatus, count, triggerCount })
    })()

    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_BASE)
    const addEvent = (data) => {
      setLiveEvents((events) => {
        let currEvents = [...events]
        currEvents.push({ ts: new Date(), event: data.data })
        if (currEvents.length > 5) currEvents = currEvents.slice(-5)
        return currEvents
      })
    }
    ws.addEventListener('message', addEvent)
    return () => {
      ws.removeEventListener('message', addEvent)
    }
  }, [])

  const handleSubmit = async (e) => {
    setLoading(true)
    e.preventDefault()
    setSuccess(false)
    setError(false)

    try {
      const form = new FormData(e.target)

      const token = await grecaptcha.execute(
        '6LcaQLcZAAAAAKiWMe5dw56olYAlxsC3m3zc-8NO',
        {
          action: 'submit',
        }
      )

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/alert`, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          commodity: form.get('commodity'),
          type: form.get('type'),
          trigger: form.get('trigger'),
          value: form.get('value'),
          minSupply: form.get('minSupply'),
          minDemand: form.get('minDemand'),
          pad: form.get('pad'),
          includePlanetary: form.get('includePlanetary') === 'on',
          includeFleetCarrier: form.get('includeFleetCarrier') === 'on',
          webhook: form.get('webhook'),
          freq: form.get('freq'),
          token: token,
        }),
      })

      if (res.ok) {
        //plausible('Create')
        setSuccess(true)
        setError(null)
        setLoading(false)
      } else {
        setSuccess(false)
        setError(`${res.status} ${res.statusText}`)
        setLoading(false)
      }
    } catch (err) {
      setSuccess(false)
      setError(err.message)
      setLoading(false)
    }
  }

  const handleManage = (e) => {
    e.preventDefault()
    const form = new FormData(e.target)
    const webhook = form.get('webhook')
    router.push(`/manage/${encodeURIComponent(webhook)}`)
  }

  const sortName = (a, b) => {
    if (a.name > b.name) return 1
    else if (a.name < b.name) return -1
    return 0
  }

  return (
    <>
      <Head>
        <script src="https://www.google.com/recaptcha/api.js?render=6LcaQLcZAAAAAKiWMe5dw56olYAlxsC3m3zc-8NO" />
      </Head>
      <RecaptchaStyle />
      <Layout>
        <Heading as="h1" fontSize={[5, 7]}>
          ED Alerts
        </Heading>
        {Object.keys(apiData).length ? (
          <Flex alignItems="center" mb={3}>
            <Box
              bg={apiData.backendStatus ? 'limegreen' : 'red'}
              width="8px"
              height="8px"
              minWidth="8px"
              minHeight="8px"
              mr="8px"
              mt="1px"
              sx={{ borderRadius: '50%' }}
            />
            <Text color="grey">
              <Text
                as="a"
                href="https://edalerts.betteruptime.com/"
                target="_blank"
                rel="noopener noreferrer"
                color="grey"
              >
                market listener {apiData.backendStatus ? '' : 'not'} ok
              </Text>{' '}
              &bull; monitoring {apiData.count} alerts &bull; delivered{' '}
              {apiData.triggerCount.toLocaleString()} alerts in the last 24h
            </Text>
          </Flex>
        ) : (
          <Flex alignItems="center" mb={3}>
            <Loader size={16} />
            <Text color="grey" ml="6px">
              loading stats...
            </Text>
          </Flex>
        )}
        <Text as="p" fontSize={[2, 3]} mb={2} color="grey">
          create Elite Dangerous commodity market alerts. get notified when a
          specific commodity buys or sells above or below a certain value.
        </Text>
        {!success && (
          <>
            <Text fontSize={[2, 3]} mb={2} color="grey">
              alert me when...
            </Text>
            <form onSubmit={handleSubmit}>
              <Select name="commodity" mb={2} required>
                <optgroup label="Commodities">
                  {commodities.sort(sortName).map((commodity) => (
                    <option
                      key={commodity.id}
                      value={commodity.symbol.toLowerCase()}
                    >
                      {commodity.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Rare commodities">
                  {rarecommodities.sort(sortName).map((commodity) => (
                    <option
                      key={commodity.id}
                      value={commodity.symbol.toLowerCase()}
                    >
                      {commodity.name}
                    </option>
                  ))}
                </optgroup>
              </Select>
              <Box
                mb={2}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: ['repeat(1, 1fr)', 'repeat(3, 1fr)'],
                  gridGap: [2, 1],
                }}
              >
                <Select
                  name="type"
                  onChange={(e) => setAlertType(e.target.value)}
                  required
                >
                  <option value="sell">sell</option>
                  <option value="buy">buy</option>
                </Select>
                <Select name="trigger" required>
                  <option value="above">above</option>
                  <option value="below">below</option>
                </Select>
                <Input
                  type="number"
                  name="value"
                  placeholder="value"
                  min={0}
                  required
                />
              </Box>
              <Box
                mb={2}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: ['repeat(1, 1fr)', 'repeat(2, 1fr)'],
                  gridGap: [2, 1],
                }}
              >
                {alertType === 'buy' && (
                  <Input
                    type="number"
                    name="minSupply"
                    placeholder="min. supply"
                    min={0}
                    required
                  />
                )}
                {alertType === 'sell' && (
                  <Input
                    type="number"
                    name="minDemand"
                    placeholder="min. demand"
                    min={0}
                    required
                  />
                )}
                <Select name="pad" required>
                  <option value="any">any pad size</option>
                  <option value="l">large pad required</option>
                </Select>
              </Box>
              <Box
                mb={2}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: ['repeat(1, 1fr)', 'repeat(2, 1fr)'],
                  gridGap: [2, 1],
                }}
              >
                <Checkbox name="includePlanetary" label="Include planetary" />
                <Checkbox
                  name="includeFleetCarrier"
                  label="Include fleet carriers"
                />
              </Box>
              <Box mb={2}>
                <Flex alignItems="center">
                  <Input
                    type="url"
                    name="webhook"
                    placeholder="discord webhook url"
                    mr={1}
                    required
                  />
                  <Box
                    color={showHelp ? 'primary' : 'grey'}
                    onClick={() => setShowHelp(!showHelp)}
                    css={{ cursor: 'pointer' }}
                  >
                    <HelpCircle size={32} />
                  </Box>
                </Flex>
                {showHelp && (
                  <Text color="grey" mt={1}>
                    ED Alerts sends notifications via{' '}
                    <Text
                      as="a"
                      href="https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks"
                      color="grey"
                    >
                      Discord
                    </Text>
                    . to create a webhook, you first need a Discord server -
                    this could be an existing one you have suitable permissions
                    in or you can create one for free. next, edit the settings
                    of a text channel, select ‘integrations’ and then
                    ‘webhooks’. create a new webhook, and copy the url here.
                    don’t worry about the name and avatar, as these will be
                    overwritten by ED Alerts.
                  </Text>
                )}
              </Box>
              <Box mb={3}>
                <Select
                  name="freq"
                  defaultValue={10000}
                  onChange={(e) => {
                    if (e.target.value === '0') setShowLimitWarning(true)
                    else setShowLimitWarning(false)
                  }}
                  required
                >
                  {Object.entries(intervalOptions).map(([time, text]) => (
                    <option key={time} value={time}>
                      {text}
                    </option>
                  ))}
                </Select>
                {showLimitWarning && (
                  <Text color="grey" mt={1}>
                    <Text as="span" color="primary">
                      warning:
                    </Text>{' '}
                    if your alert is triggered too frequently Discord may start
                    rate limiting your webhook, causing{' '}
                    <strong>all alerts to that webhook be undelivered</strong>.
                    this risk even is higher if you use the same webhook for
                    multiple alerts — if you need as-they-happen alerts (and you
                    most likely don’t), it is recommended that you use a
                    separate webhook for each.
                  </Text>
                )}
              </Box>
              <Button width={1} loading={loading}>
                Create alert
              </Button>
            </form>
            <Box>
              <Divider color="grey" fontSize={3} textAlign="center" my={4}>
                OR
              </Divider>
              <form onSubmit={handleManage}>
                <Input
                  type="text"
                  name="webhook"
                  placeholder="discord webhook url"
                  required
                  mb={2}
                />
                <Button width={1}>Manage your alerts</Button>
              </form>
            </Box>
            {error && (
              <Text as="p" mt={3} fontSize={[2, 3]} color="error">
                error: {error}
              </Text>
            )}
          </>
        )}
        {success && (
          <Text as="p" fontSize={[2, 3]}>
            your alert was created successfully. why not{' '}
            <Text
              as="span"
              onClick={() => {
                window.location.reload()
              }}
              css={{ textDecoration: 'underline', cursor: 'pointer' }}
            >
              create another
            </Text>
            ?
          </Text>
        )}
        <Box p={2} mt={4} sx={{ border: '2px solid', borderColor: 'grey' }}>
          <Text color="primary" mb={1}>
            LIVE
          </Text>
          {liveEvents.length ? (
            liveEvents
              .map((event) => (
                <Box
                  display="grid"
                  sx={{
                    gridTemplateColumns: '100px 18px auto',
                    gridGap: '10px',
                    alignItems: ['start', 'center'],
                  }}
                >
                  <Text as="span" color="grey" fontSize="14px">
                    {moment(event.ts).format('HH:mm:ss.SSS')}
                  </Text>
                  <Flex
                    alignItems="center"
                    color="primary"
                    width="18px"
                    height="18px"
                  >
                    <ErrorCircle size={18} />
                  </Flex>
                  {event.event}
                </Box>
              ))
              .reverse()
          ) : (
            <Text>Waiting for alerts...</Text>
          )}
        </Box>
        <Text
          as="a"
          href="mailto:contact@edalerts.app"
          color="grey"
          display="inline-block"
          mt={3}
        >
          contact@edalerts.app
        </Text>
        <Text color="grey" fontSize={0} mt={2}>
          if you make good use of ED Alerts, please consider donating! it
          doesn’t cost a huge amount to run but it does come out of my own
          pocket. any amount is greatly appreciated, get in touch via email for
          details.
        </Text>
        <Box mt={1}>
          <Text color="grey" fontSize={0}>
            &copy; {new Date().getFullYear()}{' '}
            <Text
              as="a"
              href="https://tdjs.tech"
              target="_blank"
              rel="noopener noreferrer"
              color="grey"
              fontSize={0}
            >
              tdjs.tech
            </Text>{' '}
            / CMDR tdjs
          </Text>
        </Box>
      </Layout>
    </>
  )
}

export default Index
