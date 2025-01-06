import React, { useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { ThemeProvider, createGlobalStyle } from 'styled-components'
import * as ga from '../lib/ga'

const theme = {
  breakpoints: ['768px'],
  colors: {
    primary: '#f87b00',
    white: '#fff',
    black: '#202224',
    grey: '#999',
    error: '#f33',
  },
  space: [5, 10, 20, 40, 80, 100, 200],
  sizes: {
    body: '800px',
  },
  fonts: {
    heading: 'Inter, system-ui, sans-serif',
    body: 'Inter, system-ui, sans-serif',
  },
  fontSizes: [14, 16, 20, 24, 36, 48, 60, 80, 96],
  fontWeights: {
    heading: 700,
    body: 400,
  },
  lineHeights: {
    heading: 1.2,
    body: 1.4,
  },
}

const GlobalStyle = createGlobalStyle(
  ({ theme: { fonts, colors, lineHeights } }) => `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  body {
    color: ${colors.white};
    background: ${colors.black};
    font-family: ${fonts.body};
    line-height: ${lineHeights.body};
  }
`
)

export const reportWebVitals = ({ id, name, label, value }) => {
  ga.event({
    action: name,
    params: {
      event_category:
        label === 'web-vital' ? 'Web Vitals' : 'Next.js custom metric',
      value: Math.round(name === 'CLS' ? value * 1000 : value), // values must be integers
      event_label: id, // id unique to current page load
      non_interaction: true, // avoids affecting bounce rate.
    },
  })
}

const EDAlerts = ({ Component, pageProps }) => {
  const router = useRouter()

  useEffect(() => {
    const handleRouteChange = (url) => {
      ga.pageview(url)
    }

    router.events.on('routeChangeComplete', handleRouteChange)

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router.events])

  return (
    <>
      <Head>
        <title>ED Alerts — Elite Dangerous commodity market alerts</title>
        <meta
          property="og:title"
          content="ED Alerts — Elite Dangerous commodity market alerts"
        />
        <meta
          name="description"
          content="create Elite Dangerous commodity market alerts. get notified when a specific commodity buys or sells above or below a certain value."
        />
        <meta
          property="og:description"
          content="create Elite Dangerous commodity market alerts. get notified when a specific commodity buys or sells above or below a certain value."
        />
        <meta
          property="og:site_name"
          content="ED Alerts — Elite Dangerous commodity market alerts"
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://edalerts.app" />
        <link rel="icon" href="favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </Head>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <Component {...pageProps} />
      </ThemeProvider>
    </>
  )
}

export default EDAlerts
