import ConfirmDialog from '@/components/confirm'
import { EnglishWords } from '@/types'
import { Topic, TopicItem, TopicType } from '@/types/course/quiz/topic'
import { guid } from '@/utils/data'
import { Button, FormControl, FormHelperText, InputLabel, MenuItem, Select, TextField } from '@mui/material'
import { useState } from 'react'
import { FieldArrayMethodProps } from 'react-hook-form'

type Error = {
  type?: 'error'
  optionCount?: 'error'
  itemsCount?: 'error'
}

const AddOption = ({
  isPDF,
  append
}: {
  isPDF: boolean
  append: (value: Topic | Topic[], options?: FieldArrayMethodProps | undefined) => void
}) => {
  //States
  const [type, setType] = useState<TopicType>()
  const [optionCount, setOptionCount] = useState<number>()
  const [itemsCount, setItemsCount] = useState<number>(2)
  const [errors, setErrors] = useState<Error>()

  const handleAddTopic = () => {
    const err: Error = {}
    if (type === undefined) {
      err.type = 'error'
    }
    if (!optionCount) {
      err.optionCount = 'error'
    }
    if (!itemsCount && (type === TopicType.Single || type === TopicType.Multiple)) {
      err.itemsCount = 'error'
    }
    if (Object.keys(err).length > 0) {
      setErrors(err)

      return false
    }
    const items: TopicItem[] = []
    if (type === TopicType.TrueOrFalse) {
      items.push({ _id: guid(), title: 'true' })
      items.push({ _id: guid(), title: 'false' })
    } else if (type === TopicType.Single || type === TopicType.Multiple)
      for (let index = 0; index < (itemsCount || 0); index++) {
        items.push({ _id: guid(), title: isPDF ? EnglishWords[index] : `title${index + 1}` })
      }
    for (let index = 0; index < (optionCount || 0); index++) {
      append({
        _id: guid(),
        title: '',
        questionType: type as TopicType,
        score: 1,
        value: [],
        items
      })
    }
  }

  return (
    <div className='w-auto text-center'>
      <ConfirmDialog
        title={`Add question`}
        width={360}
        top={2}
        confirm={handleAddTopic}
        content={
          <>
            <FormControl className='w-full'>
              <InputLabel id='demo-basic-select-outlined-label'>Type</InputLabel>
              <Select
                label='Type'
                id='demo-basic-select-outlined'
                labelId='demo-basic-select-outlined-label'
                value={type}
                onChange={e => {
                  setType(parseInt(e.target.value as string))
                  if (errors) {
                    const { ...newObj } = errors
                    delete newObj.type
                    setErrors(newObj)
                  }
                }}
              >
                {Object.entries(TopicType)
                  .filter(([key]) => isNaN(Number(key)))
                  .map(([key, value]) => (
                    <MenuItem key={key} value={value}>
                      {key}
                    </MenuItem>
                  ))}
              </Select>
              {errors?.type && <FormHelperText sx={{ color: 'error.main' }}>The field is required</FormHelperText>}
            </FormControl>
            <TextField
              fullWidth
              label='Number of questions'
              type='number'
              inputProps={{ min: 1, max: 10 }}
              sx={{ marginTop: '15px' }}
              {...(errors?.optionCount && {
                error: true,
                helperText: 'The field is required'
              })}
              value={optionCount}
              onChange={e => {
                setOptionCount(parseInt(e.target.value))
                if (errors) {
                  if (e.target.value) {
                    const { ...newObj } = errors
                    delete newObj.optionCount
                    setErrors(newObj)
                  } else {
                    const { ...newObj } = errors
                    newObj.optionCount = 'error'
                    setErrors(newObj)
                  }
                }
              }}
            />
            {(type === TopicType.Single || type === TopicType.Multiple) && (
              <TextField
                fullWidth
                label='Choices'
                type='number'
                inputProps={{ min: 1 }}
                sx={{ marginTop: '15px' }}
                {...(errors?.itemsCount && {
                  error: true,
                  helperText: 'The field is required'
                })}
                value={itemsCount}
                onChange={e => {
                  setItemsCount(parseInt(e.target.value))
                  if (errors) {
                    if (e.target.value) {
                      const { ...newObj } = errors
                      delete newObj.itemsCount
                      setErrors(newObj)
                    } else {
                      const { ...newObj } = errors
                      newObj.itemsCount = 'error'
                      setErrors(newObj)
                    }
                  }
                }}
              />
            )}
          </>
        }
      >
        <Button variant='contained' startIcon={<i className='ri-add-line' />}>
          Add question
        </Button>
      </ConfirmDialog>
    </div>
  )
}

export default AddOption
