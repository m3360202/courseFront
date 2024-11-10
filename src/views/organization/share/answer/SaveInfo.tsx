'use client'

import TextField from '@mui/material/TextField'

// Third-party Imports
import { Control, Controller, FieldErrors, useForm } from 'react-hook-form'

import { nonEmpty, object, pipe, regex, string, email } from 'valibot'

import { Card, CardContent, Grid, InputAdornment } from '@mui/material'

import LoadingButton from '@mui/lab/LoadingButton'

import Title from '@/components/title'
import { useDictionary } from '@/hooks/useDictionary'

import { CustomDivider } from '@/components/divider'
import { informationData } from '@/types'
import { RequiredStar } from '@/components/form-field'

import FormLayout from '@/components/layout/FormLayout'
import { valibotResolver } from '@hookform/resolvers/valibot'

const renderDivider = (title: string) => (
  <Grid item xs={12} key={title}>
    <CustomDivider>
      <Title variant='h5'>{title}</Title>
    </CustomDivider>
  </Grid>
)

const renderCtl = (title: string, key: string, control: Control<any, any>, errors: FieldErrors<any>) => (
  <Grid item xs={6} key={key}>
    <Controller
      name={key}
      control={control}
      rules={{ required: true }}
      render={({ field }) => (
        <TextField
          onChange={field.onChange}
          fullWidth
          label={title}
          placeholder=''
          {...(errors &&
            errors[key] && {
            error: true,
            helperText: errors && errors[key] ? (errors[key]?.message as string) : undefined
          })}
          InputProps={{
            startAdornment: <InputAdornment position='start'>{<RequiredStar />}</InputAdornment>
          }}
        />
      )}
    />
  </Grid>
)

const renderInfo = (info: string[], control?: Control<any, any>, errors?: FieldErrors<any>) => {
  const eles: JSX.Element[] = []
  const studentInfo: { title: string; value: string }[] = []
  const parentInfo: { title: string; value: string }[] = []
  const parent1Info: { title: string; value: string }[] = []
  informationData
    .find(c => c.title === 'Student information')
    ?.items.filter(c => info.includes(c.value))
    .map(c => {
      studentInfo.push(...c.key)
    })
  informationData
    .find(c => c.title === 'Parent 1 information')
    ?.items.filter(c => info.includes(c.value))
    .map(c => {
      parentInfo.push(...c.key)
    })
  informationData
    .find(c => c.title === 'Parent 2 information')
    ?.items.filter(c => info.includes(c.value))
    .map(c => {
      parent1Info.push(...c.key)
    })

  if (control && errors) {
    if (studentInfo.length > 0) {
      eles.push(renderDivider('Student information'))
      studentInfo.map(c => eles.push(renderCtl(c.title, c.value, control, errors)))
    }
    if (parentInfo.length > 0) {
      eles.push(renderDivider('Parent 1 information'))
      parentInfo.map(c => eles.push(renderCtl(c.title, c.value, control, errors)))
    }
    if (parent1Info.length > 0) {
      eles.push(renderDivider('Parent 2 information'))
      parent1Info.map(c => eles.push(renderCtl(c.title, c.value, control, errors)))
    }
  }

  return {
    eles,
    fields: studentInfo
      .concat(parentInfo)
      .concat(parent1Info)
      .map(c => c.value)
  }
}

const SaveInfo = ({ info, handleNext }: { info?: string[]; handleNext: (data: { [key: string]: string }) => void }) => {
  if (!info) return null

  // Hooks
  const dictionary = useDictionary()

  //vars
  const { fields } = renderInfo(info)

  const obj: any = {}

  fields.forEach((field) => {
    switch (field) {
      case 'firstName':
      case 'lastName':
      case 'parent1FirstName':
      case 'parent1LastName':
      case 'parentFirstName':
      case 'parentLastName':
        obj[field] = pipe(
          string(dictionary.common.fieldRequired),
          nonEmpty(dictionary.common.fieldRequired),
          regex(/^[a-zA-Z\u4e00-\u9fa5]+$/, dictionary.common.noNumbers),
          regex(/^.{2,}$/, dictionary.common.leastChar),
        );
        break;
      case 'email':
      case 'parent1Email':
      case 'parentEmail':
        obj[field] = pipe(
          string(dictionary.common.fieldRequired),
          nonEmpty(dictionary.common.fieldRequired),
          email(dictionary.common.emailWrong)
        );
        break;
      case 'phone':
      case 'parentPhone':
      case 'parent1Phone':
        obj[field] = pipe(
          string(dictionary.common.fieldRequired),
          nonEmpty(dictionary.common.fieldRequired),
          regex(/^[0-9-]+$/, dictionary.common.noNumbers)
        );
        break;
      default:
        obj[field] = pipe(
          string(dictionary.common.fieldRequired),
          nonEmpty(dictionary.common.fieldRequired)
        );
        break;
    }
  });

  const schema = object(obj)
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<any>({
    defaultValues: {
      timetable: []
    },
    resolver: valibotResolver(schema)
  })

  const { eles } = renderInfo(info, control, errors)

  const onSubmit = (data: any) => {
    handleNext(data)
  }

  return (
    <FormLayout>
      <Card>
        <CardContent>
          <Grid container spacing={5}>
            {eles}
            <Grid item xs={12} mt={10} textAlign={'center'}>
              <LoadingButton variant='contained' onClick={handleSubmit(onSubmit)}>
                Next step
              </LoadingButton>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </FormLayout>
  )
}

export default SaveInfo
