import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { Flex, Box, Heading, Text } from 'rebass/styled-components'
import GA from 'react-ga'
import styled from 'styled-components'
import css from '@styled-system/css'
import { createGlobalStyle } from 'styled-components'
import { HelpCircle } from '@styled-icons/boxicons-regular'
import Layout from '../components/Layout'
import Button from '../components/Button'
import Input from '../components/Input'
import Select from '../components/Select'

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
  const [backendOk, setBackendOk] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)
  const [showHelp, setShowHelp] = useState(false)
  const [alertType, setAlertType] = useState('sell')
  const [count, setCount] = useState('?')
  const router = useRouter()

  useEffect(() => {
    const getBackendStatus = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}`)
        if (res.ok) {
          setBackendOk(true)
        } else {
          setBackendOk(false)
        }
      } catch (err) {
        setBackendOk(false)
      }
    }

    const getAlertCount = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/count`)
      const { count } = await res.json()
      if (!isNaN(count)) setCount(count)
    }

    GA.initialize('UA-87488863-7')
    GA.pageview(window.location.pathname + window.location.search)
    getBackendStatus()
    getAlertCount()
  }, [])

  const handleSubmit = async (e) => {
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
          webhook: form.get('webhook'),
          freq: form.get('freq'),
          token: token,
        }),
      })

      if (res.ok) {
        setSuccess(true)
        setError(null)

        GA.event({
          category: 'Alert',
          action: 'Created',
        })
      } else {
        setSuccess(false)
        setError(`${res.status} ${res.statusText}`)
      }
    } catch (err) {
      setSuccess(false)
      setError(err.message)
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
        <Flex alignItems="center" mb={3}>
          <Box
            bg={backendOk ? 'limegreen' : 'red'}
            width="8px"
            height="8px"
            mr="8px"
            mt="1px"
            sx={{ borderRadius: '50%' }}
          />
          <Text color="grey">
            <Text
              as="a"
              href="https://status.edalerts.app"
              color="grey"
              lineHeight={1}
            >
              market listener {backendOk ? '' : 'not'} running
            </Text>{' '}
            &bull; monitoring {count} alerts
          </Text>
        </Flex>
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
              <Flex alignItems="center" mb={showHelp ? 1 : 2}>
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
                <Text color="grey" mb={2}>
                  ED Alerts sends notifications via{' '}
                  <Text as="a" href="https://discord.com" color="grey">
                    Discord
                  </Text>
                  . to create a webhook, you first need a Discord server - this
                  could be an existing one you have suitable permissions in or
                  you can create one for free. next, edit the settings of a text
                  channel, select ‘integrations’ and then ‘webhooks’. create a
                  new webhook, and copy the url here. don’t worry about the name
                  and avatar, as these will be overwritten by ED Alerts.
                </Text>
              )}
              <Select name="freq" mb={3} required>
                {Object.entries(intervalOptions).map(([time, text]) => (
                  <option key={time} value={time}>
                    {text}
                  </option>
                ))}
              </Select>
              <Button width={1}>Create alert</Button>
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
        <Text
          as="a"
          href="mailto:contact@edalerts.app"
          color="grey"
          display="inline-block"
          mt={4}
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
          <Text
            as="a"
            href="https://tdjs.tech"
            target="_blank"
            rel="noopener noreferrer"
            color="grey"
            fontSize={0}
          >
            tdjs.tech
          </Text>
        </Box>
      </Layout>
    </>
  )
}

export default Index
