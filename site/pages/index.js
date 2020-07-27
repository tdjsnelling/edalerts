import React, { useState, useEffect } from 'react'
import { Flex, Box, Heading, Text } from 'rebass/styled-components'
import GA from 'react-ga'
import Layout from '../components/Layout'
import Button from '../components/Button'
import Input from '../components/Input'
import Select from '../components/Select'

import commodities from '../commodities.json'

const Index = () => {
  const [backendOk, setBackendOk] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

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

    GA.initialize('UA-87488863-7')
    GA.pageview(window.location.pathname + window.location.search)
    getBackendStatus()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const form = new FormData(e.target)
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
          webhook: form.get('webhook'),
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

  const sortName = (a, b) => {
    if (a.name > b.name) return 1
    else if (a.name < b.name) return -1
    return 0
  }

  return (
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
        <Text
          as="a"
          href="https://status.edalerts.app"
          color="grey"
          lineHeight={1}
        >
          market listener {backendOk ? '' : 'not'} running
        </Text>
      </Flex>
      <Text as="p" fontSize={[2, 3]} mb={3} color="grey">
        create Elite: Dangerous commodity market alerts. get notified when a
        specific commodity buys or sells above or below a certain value.
      </Text>
      {!success && (
        <>
          <Text fontSize={[2, 3]} mb={2} color="grey">
            alert me when...
          </Text>
          <form onSubmit={handleSubmit}>
            <Select name="commodity" mb={2} required>
              {commodities.sort(sortName).map((commodity) => (
                <option
                  key={commodity.id}
                  value={commodity.symbol.toLowerCase()}
                >
                  {commodity.name}
                </option>
              ))}
            </Select>
            <Box
              mb={2}
              sx={{
                display: 'grid',
                gridTemplateColumns: ['repeat(1, 1fr)', 'repeat(3, 1fr)'],
                gridGap: [2, 1],
              }}
            >
              <Select name="type" required>
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
            <Input
              type="url"
              name="webhook"
              placeholder="discord webhook url"
              mb={3}
              required
            />
            <Button width={1}>Create alert</Button>
          </form>
          {error && (
            <Text as="p" mt={3} fontSize={[2, 3]} color="error">
              error: {error}
            </Text>
          )}
        </>
      )}
      {success && (
        <Text as="p" fontSize={[2, 3]}>
          your alert was created successfully.
        </Text>
      )}
      <Text
        as="a"
        href="mailto:contact@edalerts.app"
        color="grey"
        display="inline-block"
        mt={3}
      >
        contact@edalerts.app
      </Text>
    </Layout>
  )
}

export default Index
