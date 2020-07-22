import React from 'react'
import { Box } from 'rebass/styled-components'

const Layout = ({ children }) => (
  <Box px={2} py={[2, 5]} maxWidth="body" mx="auto">
    {children}
  </Box>
)

export default Layout
