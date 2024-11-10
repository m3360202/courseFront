'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'

// Utils Imports
import { getStateOfDetail } from '.'

const GetStatus = ({ detail }: any) => {
  const [color, setColor] = useState<"primary" | "default" | "error" | "success" | "secondary" | "info" | "warning">('primary')
  const [label, setLabel] = useState<string>('')

  const getState = () => {

    if (getStateOfDetail(detail) === 'Not Started') {
      setLabel('Not Started')
      setColor('error')

      return;
    }
    if (getStateOfDetail(detail) === 'Graded') {
      setLabel('Graded')
      setColor('success')

      return;
    }
    if (getStateOfDetail(detail) === 'Active') {
      setLabel('Active')
      setColor('info')

      return;
    }
    if (getStateOfDetail(detail) === 'Submitted') {
      setLabel('Submitted')
      setColor('primary')

      return;
    }
    if (getStateOfDetail(detail) === 'Expired') {
      setLabel('Expired')
      setColor('secondary')

      return;
    }
  }

  useEffect(() => {
    if (detail) {
      getState()
    }
  }, [detail])

  return (
    <Box>
      <Chip
        label={label}
        size='small'
        color={color}
        variant='tonal'
        className='self-start rounded-sm'
      />
    </Box>
  )
}

export default GetStatus
