import React from 'react'
import styled from 'styled-components'
import css from '@styled-system/css'
import { Box, Text } from 'rebass/styled-components'

const Container = styled.label(() =>
  css({
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    input: {
      opacity: 0,
      height: 0,
      width: 0,
      '&:focus': {
        '& ~ .check': {
          bg: 'grey7',
        },
      },
      '&:checked': {
        '& ~ .check': {
          borderColor: 'primary',
          '.inner': {
            bg: 'primary',
          },
        },
      },
    },
    '.check': {
      display: 'inline-flex',
      bg: 'grey9',
      border: '2px solid',
      borderColor: 'grey',
      borderRadius: 1,
      width: '22px',
      height: '22px',
    },
    '.inner': {
      width: '12px',
      height: '12px',
      bg: 'transparent',
    },
    '&:hover': {
      '.check': {
        bg: 'grey8',
      },
    },
  })
)

const Checkbox = ({ label, name }) => (
  <Container>
    <input type="checkbox" name={name} />
    <Box alignItems="center" justifyContent="center" className="check">
      <Box className="inner" />
    </Box>
    <Text
      as="span"
      display="inline-block"
      color="white"
      ml={1}
      lineHeight="22px"
      fontSize={1}
    >
      {label}
    </Text>
  </Container>
)

export default Checkbox
