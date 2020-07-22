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

const StyledInput = styled.input(
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
    pr = '15px',
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
      '&:focus': { outline: 0 },
    })
)

const Input = ({ ...props }) => <StyledInput {...props} />

export default Input
