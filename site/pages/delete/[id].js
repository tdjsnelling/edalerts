import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Heading, Text } from 'rebass/styled-components'
import Layout from '../../components/Layout'
import { HomeLink } from '../manage/[webhook]'

const Index = () => {
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)
  const {
    query: { id },
  } = useRouter()

  useEffect(() => {
    const deleteAlert = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}/alert/${id}`,
          {
            method: 'delete',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )

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

    if (id) deleteAlert()
  }, [id])

  return (
    <Layout>
      <Link href="/" passHref>
        <HomeLink>&larr; home</HomeLink>
      </Link>
      <Heading as="h1" fontSize={[5, 7]} mb={2}>
        ED Alerts
      </Heading>
      <Text as="p" fontSize={[2, 3]} mb={3} color="grey">
        create Elite Dangerous commodity market alerts. get notified when a
        specific commodity buys or sells above or below a certain value.
      </Text>
      {!success && !error && (
        <Text as="p" fontSize={[2, 3]}>
          loading...
        </Text>
      )}
      {success && (
        <Text as="p" fontSize={[2, 3]}>
          your alert was deleted successfully.
        </Text>
      )}
      {error && (
        <Text as="p" fontSize={[2, 3]} color="error">
          error deleting: {error}
        </Text>
      )}
    </Layout>
  )
}

export default Index
