'use client'

import React from 'react'
import { Box, Chip, TextField, MenuItem, FormControl, InputLabel, Select, Grid } from '@mui/material'
import { Controller, useFormContext } from 'react-hook-form'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import AddressInput from '@components/address-input'
import { WEEKNAME } from '@/types'

interface FormValues {
  startTime?: Date | null
  endTime?: Date | null
  timetable?: number[]
  address?: string
  classroomInfo?: string
}

const CourseFilter: React.FC = () => {
  const { control } = useFormContext<FormValues>()

  return (
    <Box sx={{ flexGrow: 1, mb: 3, mt: 3 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <Controller
            name='startTime'
            control={control}
            defaultValue={null}
            render={({ field }) => (
              <AppReactDatepicker
                selected={field.value}
                onChange={(date: Date | null) => field.onChange(date)}
                placeholderText='MM/DD/YYYY'
                customInput={<TextField fullWidth label='Start Date' />}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <Controller
            name='endTime'
            control={control}
            defaultValue={null}
            render={({ field }) => (
              <AppReactDatepicker
                selected={field.value}
                onChange={(date: Date | null) => field.onChange(date)}
                placeholderText='MM/DD/YYYY'
                customInput={<TextField fullWidth label='End Date' />}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel id='timetable-label'>Session Schedule</InputLabel>
            <Controller
              name='timetable'
              control={control}
              defaultValue={[]}
              render={({ field }) => (
                <Select
                  labelId='timetable-label'
                  multiple
                  label='Session Schedule'
                  {...field}
                  renderValue={(selected: number[]) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value: number) =>
                        WEEKNAME[value] ? <Chip key={value} label={WEEKNAME[value]} /> : null
                      )}
                    </Box>
                  )}
                  onChange={e => {
                    const {
                      target: { value }
                    } = e
                    field.onChange(typeof value === 'string' ? value.split(',').map(Number) : value)
                  }}
                >
                  {WEEKNAME.map((name, index) => (
                    <MenuItem key={index} value={index}>
                      {name}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name='address'
            control={control}
            defaultValue=''
            render={({ field }) => (
              <AddressInput value={field.value as string} onChange={field.onChange} label='Address' />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name='classroomInfo'
            control={control}
            defaultValue=''
            render={({ field }) => <TextField {...field} fullWidth label='Classroom Information' />}
          />
        </Grid>
      </Grid>
    </Box>
  )
}

export default CourseFilter
