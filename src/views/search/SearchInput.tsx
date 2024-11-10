'use client'

import { FormControl, FormHelperText, TextField, Typography, InputAdornment } from '@mui/material'
import { Controller, SubmitHandler, useFormContext } from 'react-hook-form'
import React from 'react'

interface FormValues {
  text: string
}

interface SearchInputProps {
  onSearch: SubmitHandler<any>
}

const SearchInput: React.FC<SearchInputProps> = ({ onSearch }) => {
  const {
    handleSubmit,
    control,
    formState: { errors }
  } = useFormContext<FormValues>()

  return (
    <FormControl>
      <Controller
        name='text'
        control={control}
        defaultValue=''
        render={({ field: { value, onChange, onBlur } }) => (
          <TextField
            autoFocus
            value={value}
            onBlur={onBlur}
            onChange={onChange}
            error={Boolean(errors.text)}
            sx={{ minWidth: 800 }}
            variant='outlined'
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <i className='ri-search-line' />
                </InputAdornment>
              ),
              endAdornment: (
                <Typography onClick={handleSubmit(onSearch)} sx={{ color: '#00386d', cursor: 'pointer' }}>
                  Search
                </Typography>
              )
            }}
          />
        )}
      />
      {errors.text?.message && (
        <FormHelperText sx={{ color: 'error.main', marginTop: 2 }}>{errors.text.message}</FormHelperText>
      )}
    </FormControl>
  )
}

export default SearchInput
