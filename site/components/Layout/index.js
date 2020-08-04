import React from 'react'
import { Box } from 'rebass/styled-components'

const Layout = ({ children }) => (
  <Box px={2} py={[2, 4]} maxWidth="body" mx="auto">
    {children}
  </Box>
)

export default Layout
