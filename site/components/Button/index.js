import React from 'react'
import Link from 'next/link'
import styled, { keyframes } from 'styled-components'
import {
  space,
  layout,
  background,
  color,
  typography,
  border,
  variant,
  position,
} from 'styled-system'
import css from '@styled-system/css'
import { Loader } from '@styled-icons/boxicons-regular'
import shouldForwardProp from '@styled-system/should-forward-prop'

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`

const Loading = styled(Loader)`
  animation: ${spin} 2s linear infinite;
`

const StyledButton = styled.button.withConfig({ shouldForwardProp })(
  space,
  layout,
  background,
  color,
  typography,
  border,
  position,
  ({
    px = 3,
    py = 2,
    bg = 'white',
    color = 'black',
    border = '2px solid',
    borderColor = 'white',
    fontWeight = 'bold',
    fontFamily = 'heading',
    fontSize = 1,
  }) =>
    css({
      px,
      py,
      fontFamily,
      fontWeight,
      fontSize,
      bg,
      color,
      border,
      borderColor,
      cursor: 'pointer',
      '&:hover': {
        textDecoration: 'underline',
      },
      '&:focus': { outline: 0 },
      '&[disabled]': {
        opacity: 0.5,
        pointerEvents: 'none',
      },
    }),
  () =>
    variant({
      variants: {
        secondary: {
          bg: 'black',
          color: 'white',
        },
        small: {
          px: 2,
          py: 1,
        },
      },
    })
)

const Button = ({ children, href, loading, ...props }) =>
  href ? (
    <>
      {href.startsWith('http') ? (
        <a href={href}>
          <StyledButton {...props}>{children}</StyledButton>
        </a>
      ) : (
        <Link href={href} passHref>
          <a>
            <StyledButton {...props}>{children}</StyledButton>
          </a>
        </Link>
      )}
    </>
  ) : (
    <StyledButton {...props}>
      {loading ? <Loading size={20} /> : children}
    </StyledButton>
  )

export default Button
