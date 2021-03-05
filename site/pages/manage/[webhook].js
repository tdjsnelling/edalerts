import React, { useState } from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import css from '@styled-system/css'
import { Heading, Text, Flex, Box } from 'rebass/styled-components'
import moment from 'moment'
import { Trash } from '@styled-icons/boxicons-regular'
import Layout from '../../components/Layout'
import Button from '../../components/Button'

import commodities from '../../commodities.json'
import rarecommodities from '../../rarecommodities.json'

import { intervalOptions } from '../index'

export const HomeLink = styled.a(() =>
  css({
    color: 'grey',
    textDecoration: 'none',
  })
)

const List = styled.ul(() =>
  css({
    listStyle: 'none',
    li: {
      border: '2px solid',
      p: 1,
      mb: 1,
    },
  })
)

const getCommodityName = (symbol) => {
  const commodity = commodities
    .concat(rarecommodities)
    .find((comm) => comm.symbol.toLowerCase() === symbol)
  return commodity.name
}

const Manage = ({ alerts }) => {
  const [deleted, setDeleted] = useState([])
  const filteredAlerts = alerts.filter((alert) => !deleted.includes(alert._id))

  return (
    <Layout>
      <Link href="/" passHref>
        <HomeLink>&larr; home</HomeLink>
      </Link>
      <Heading as="h1" fontSize={[5, 7]} mb={3}>
        ED Alerts
      </Heading>
      <Text fontSize={3} color="grey" mb={2}>
        Manage your alerts
      </Text>
      {filteredAlerts?.length ? (
        <List>
          {filteredAlerts.map((alert) => (
            <li key={alert._id}>
              <Flex alignItems="stretch" justifyContent="space-between">
                <Box>
                  <Text fontSize={2}>
                    {getCommodityName(alert.commodity)} {alert.type}{' '}
                    {alert.trigger === 'above' ? '>' : '<'} {alert.value}
                  </Text>
                  <Text color="grey">
                    {alert.minSupply && `Min. supply ${alert.minSupply}`}
                    {alert.minDemand &&
                      `Min. demand ${alert.minDemand}`} &bull;{' '}
                    {alert.pad === 'any'
                      ? 'Any pad size'
                      : 'Large pad required'}{' '}
                    &bull; Alerts sent {intervalOptions[alert.freq]}
                  </Text>
                  <Text color="grey" fontSize={0}>
                    {alert.freq !== 0 && (
                      <>
                        Last sent{' '}
                        {alert.lastSent === 0
                          ? 'never'
                          : moment(alert.lastSent).fromNow()}{' '}
                        &bull;{' '}
                      </>
                    )}
                    Created {moment(alert.created).fromNow()}
                  </Text>
                </Box>
                <Link href={`/delete/${alert._id}`}>
                  <a>
                    <Button ml={3}>
                      <Trash size={24} />
                    </Button>
                  </a>
                </Link>
              </Flex>
            </li>
          ))}
        </List>
      ) : (
        <Text color="grey" fontSize={2}>
          No alerts found.
        </Text>
      )}
    </Layout>
  )
}

export async function getServerSideProps(context) {
  const {
    params: { webhook },
  } = context

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE}/alert/webhook/${encodeURIComponent(
      webhook
    )}`
  )
  const alerts = await res.json()

  return {
    props: { alerts },
  }
}

export default Manage
