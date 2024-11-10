import { Quiz } from '@/types/course/quiz'
import { Topic, TopicType } from '@/types/course/quiz/topic'
import {
  Button,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField
} from '@mui/material'
import classnames from 'classnames'
import { Control, Controller, UseFormSetValue, useFieldArray, useWatch } from 'react-hook-form'
import DeleteButton from '../../../component/DeleteButton'
import FileUpload from '@/components/file-upload'
import uploadFile from '@/utils/uploadFile'
import { UserTable } from '@/types/user/UserTable'
import CustomImageWithDelete from '@/components/custom-image/CustomImageWithDelete'
import { BASE_URL, EnglishWords } from '@/types'
import Title from '@/components/title'
import { error } from '@/utils/toasts'
import { guid } from '@/utils/data'

const TopicItem = ({
  user,
  control,
  topicIndex,
  topic,
  isPDF,
  setValue
}: {
  user: UserTable | null
  control: Control<Quiz, any>
  topicIndex: number
  topic: Topic
  isPDF?: boolean
  setValue: UseFormSetValue<Quiz>
}) => {
  const { append, replace, remove } = useFieldArray({
    control,
    name: `topic.${topicIndex}.items`
  })

  const items = useWatch({
    control,
    name: `topic.${topicIndex}.items`
  })

  const handleAddTopicItem = () => {
    append({ _id: guid(), title: '' })
  }

  const handleMultipleAddTopicItems = (count: number) => {
    if (count > 26) {
      error('A maximum of 26 choices can be added.')

      return
    }
    if (!items || items.length === 0) return
    if (count < items.length) {
      for (let index = count - 1; index < items.length; index++) {
        remove(index)
      }
    } else if (count > items.length)
      for (let index = items.length; index < count; index++) {
        append({ _id: guid(), title: EnglishWords[index] })
      }
  }

  return (
    <>
      {topic.questionType !== TopicType.FillIn && topic.questionType !== TopicType.ShortAnswer && (
        <>
          <div className='flex justify-between'>
            <Title className='font-medium p-0' color='text.primary'>
              Choices
            </Title>
            {(topic.questionType === TopicType.Single || topic.questionType === TopicType.Multiple) &&
              (isPDF ? (
                <TextField
                  label='Choice'
                  type='number'
                  size='small'
                  inputProps={{ min: 1, max: 26 }}
                  defaultValue={items?.length}
                  sx={{ maxWidth: 100 }}
                  onChange={e => {
                    const v = parseInt(e.target.value as string)
                    handleMultipleAddTopicItems(v)
                  }}
                />
              ) : (
                <Controller
                  name={`topic.${topicIndex}.isImage`}
                  control={control}
                  render={({ field }) => {
                    return (
                      <FormControlLabel
                        label='Requires option image'
                        control={<Switch checked={topic.isImage} {...field} />}
                      />
                    )
                  }}
                />
              ))}
          </div>
          {items?.map((item, itemIndex) => (
            <div key={item._id} className={classnames('repeater-item flex relative border rounded', {})}>
              <Grid container spacing={5} className='m-0 pbe-5'>
                <Grid item xs={12} mr={4}>
                  {(topic.questionType === TopicType.Multiple ||
                    topic.questionType === TopicType.Single ||
                    topic.questionType === TopicType.TrueOrFalse) && (
                      <div className='flex gap-2 flex-col'>
                        <Controller
                          name={`topic.${topicIndex}.items.${itemIndex}.title` as any}
                          control={control}
                          rules={{ required: true }}
                          render={({ field }) => (
                            <TextField
                              className='w-full'
                              label='Choice title'
                              multiline
                              //   value={field.value}
                              //   onChange={e => {
                              //     setValue(`topic.${topicIndex}.items.${itemIndex}.title`, e.target.value)
                              //   }}
                              {...field}
                              {...(!field.value && {
                                error: true,
                                helperText: 'The field is required'
                              })}
                              disabled={topic.questionType === TopicType.TrueOrFalse}
                            />
                          )}
                        />
                        {topic.isImage &&
                          (item.file ? (
                            <CustomImageWithDelete
                              imgData={[{ value: itemIndex.toString(), img: BASE_URL + item.file }]}
                              className='max-w-28'
                              handleChange={value => {
                                setValue(`topic.${topicIndex}.items.${parseInt(value)}.file`, undefined)
                              }}
                            />
                          ) : (
                            (topic.questionType === TopicType.Single || topic.questionType === TopicType.Multiple) && (
                              <FileUpload
                                loading={false}
                                handleUploadFiles={async files => {
                                  const path = await uploadFile(user as UserTable, files[0])
                                  setValue(`topic.${topicIndex}.items.${itemIndex}.file`, path)
                                }}
                                sx={{ maxWidth: 150 }}
                              />
                            )
                          ))}
                      </div>
                    )}
                  {(topic.questionType === TopicType.FillIn || topic.questionType === TopicType.ShortAnswer) && (
                    <TextField fullWidth disabled minRows={3} multiline />
                  )}
                </Grid>
              </Grid>
              {(topic.questionType === TopicType.Single || topic.questionType === TopicType.Multiple) &&
                !isPDF &&
                items.length > 1 && (
                  <div className='flex flex-col justify-start border-is'>
                    <DeleteButton id={item._id as string} items={items} replace={replace} />
                  </div>
                )}
            </div>
          ))}
          {(topic.questionType === TopicType.Single || topic.questionType === TopicType.Multiple) && !isPDF && (
            <div className='w-auto'>
              <Button variant='contained' startIcon={<i className='ri-add-line' />} onClick={handleAddTopicItem}>
                Add Choice
              </Button>
            </div>
          )}
        </>
      )}
      {(topic.questionType === TopicType.FillIn || topic.questionType === TopicType.ShortAnswer) && (
        <Controller
          name={`topic.${topicIndex}.value` as any}
          control={control}
          render={({ field }) => (
            <TextField className='w-full' label='Answer' multiline minRows={3} maxRows={5} {...field} />
          )}
        />
      )}
      {(topic.questionType === TopicType.Single ||
        topic.questionType === TopicType.Multiple ||
        topic.questionType === TopicType.TrueOrFalse) && (
          <Controller
            name={`topic.${topicIndex}.value` as any}
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <FormControl className='w-full md:w-1/2'>
                <InputLabel id='demo-basic-select-outlined-label'>Answer</InputLabel>
                <Select
                  label='Answer'
                  id='demo-basic-select-outlined'
                  labelId='demo-basic-select-outlined-label'
                  value={field.value}
                  onChange={e => {
                    const value = topic.questionType === TopicType.Multiple ? e.target?.value : [e.target?.value]
                    setValue(`topic.${topicIndex}.value`, value)
                  }}
                  multiple={topic.questionType === TopicType.Multiple}
                //{...field}
                >
                  {items?.map((item: any) => (
                    <MenuItem key={item.title} value={item.title}>
                      {item.title}
                    </MenuItem>
                  ))}
                </Select>
                {/* {(!field.value || field.value.length === 0) && <FormHelperText sx={{ color: 'error.main' }}>The field is required</FormHelperText>} */}
              </FormControl>
            )}
          />
        )}
    </>
  )
}

export default TopicItem
