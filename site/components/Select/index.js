import React from 'react'
import styled from 'styled-components'
import {
  space,
  layout,
  background,
  color,
  typography,
  border,
  position,
  display,
} from 'styled-system'
import css from '@styled-system/css'
import { Box } from 'rebass/styled-components'
import { ChevronDown } from '@styled-icons/boxicons-regular'

const Wrapper = styled.div`
  position: relative;
  width: 100%;
`

const StyledSelect = styled.select(
  space,
  layout,
  background,
  color,
  typography,
  border,
  position,
  display,
  ({
    px = 2,
    py = '15px',
    pl = '15px',
    pr = '50px',
    bg = 'black',
    color = 'white',
    border = '2px solid',
    borderColor = 'white',
    borderRadius = '0px',
    fontFamily = 'heading',
    fontSize = 2,
    display = 'block',
    width = '100%',
  }) =>
    css({
      px,
      py,
      pl,
      pr,
      fontFamily,
      fontSize,
      bg,
      color,
      border,
      borderColor,
      borderRadius,
      display,
      width,
      appearance: 'none',
      '&:focus': { outline: 0, borderColor: 'primary' },
    })
)

const Select = ({ children, ...props }) => (
  <Wrapper>
    <StyledSelect {...props}>{children}</StyledSelect>
    <Box sx={{ position: 'absolute', right: '15px', top: '16px' }}>
      <ChevronDown size={24} />
    </Box>
  </Wrapper>
)

export default Select
