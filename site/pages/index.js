import React, { useState } from 'react'
import { Flex, Heading, Text } from 'rebass/styled-components'
import Layout from '../components/Layout'
import Button from '../components/Button'
import Input from '../components/Input'

const Index = () => {
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const form = new FormData(e.target)
      const res = await fetch('/api/register', {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: form.get('email'),
        }),
      })

      if (res.ok) {
        setSuccess(true)
        setError(null)
      } else {
        setSuccess(false)
        setError(`${res.status} ${res.statusText}`)
      }
    } catch (err) {
      setSuccess(false)
      setError(err.message)
    }
  }

  return (
    <Layout>
      <Heading as="h1" fontSize={[5, 7]} mb={2}>
        ED Alerts
      </Heading>
      <Text as="p" fontSize={[2, 3]} mb={4} color="grey">
        create Elite: Dangerous commodity market alerts. get notified when a
        specific commodity buys or sells above or below a certain value.
      </Text>
      {!success && (
        <>
          <form onSubmit={handleSubmit}>
            <Input
              type="text"
              name="commodity"
              placeholder="commodity"
              mb={2}
              required
            />
            <Flex mb={2}>
              <Input type="text" name="type" placeholder="type" required />
              <Input
                type="text"
                name="trigger"
                placeholder="trigger"
                ml={1}
                required
              />
              <Input
                type="number"
                name="value"
                placeholder="value"
                ml={1}
                required
              />
            </Flex>
            <Input
              type="text"
              name="webhook"
              placeholder="discord webhook url"
              mb={3}
              required
            />
            <Button width={1}>Submit</Button>
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
    </Layout>
  )
}

export default Index
