'use client'

import React from 'react'
import { Box, Typography } from '@mui/material'
import SearchInput from './SearchInput'
import { useFormContext, SubmitHandler } from 'react-hook-form'

interface InitialSearchProps {
  onSearch: SubmitHandler<any>
}

const InitialSearch: React.FC<InitialSearchProps> = ({ onSearch }) => {
  const { handleSubmit } = useFormContext()

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        paddingTop: 20,
        paddingX: 2
      }}
    >
      <img src='/images/logos/new-logo-long.png' width={280} alt='Logo' />

      <Typography variant='h6' sx={{ color: '#b1b1b3', marginBottom: 5, textAlign: 'center' }}>
        Search for courses, organizations and more!
      </Typography>

      <Box component='form' onSubmit={handleSubmit(onSearch)}>
        <SearchInput onSearch={onSearch} />
      </Box>
    </Box>
  )
}

export default InitialSearch
