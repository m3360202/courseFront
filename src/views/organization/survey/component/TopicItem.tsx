import { Topic, TopicType } from '@/types/course/quiz/topic'
import { Button, Grid, IconButton, TextField } from '@mui/material'
import classnames from 'classnames'
import { Control, Controller, FieldArrayMethodProps, UseFormSetValue, useFieldArray, useWatch } from 'react-hook-form'
import DeleteButton from '@/views/course/component/DeleteButton'
import Title from '@/components/title'
import AddOption from './AddOption'
import documentToScroll from '@/utils/documentToScroll'
import { guid } from '@/utils/data'
import { EnrollmentSurvey } from '@/types/organization/enrollment/survey'
import { useState } from 'react'
import Tag from '@/components/label'
import { useParams } from 'next/navigation'
import ConfirmDialog from '@/components/confirm'
import { Label } from '@/types/label'

const TopicItem = ({
  control,
  topicIndex,
  topic,
  topics,
  setValue,
  topicAppend
}: {
  control: Control<EnrollmentSurvey, any>
  topicIndex: number
  topic: Topic
  topics: Topic[]
  setValue: UseFormSetValue<EnrollmentSurvey>
  topicAppend: (value: Topic | Topic[], options?: FieldArrayMethodProps | undefined) => void
}) => {
  //States
  const [label, setLabel] = useState<Label>()

  //Hooks
  const { organizationId } = useParams()
  const { append, replace } = useFieldArray({
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

  return (
    <>
      {topic.questionType !== TopicType.FillIn && topic.questionType !== TopicType.ShortAnswer && (
        <>
          <div className='flex justify-between'>
            <Title className='font-medium p-0' color='text.primary'>
              Choices
            </Title>
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
                            InputProps={{
                              endAdornment: (
                                <ConfirmDialog
                                  title='Select tag'
                                  width={400}
                                  content={
                                    <Tag
                                      organizationId={organizationId as string}
                                      multiple={false}
                                      defaultValue={item.label}
                                      onChange={v => {
                                        setLabel(v as Label)
                                      }}
                                    />
                                  }
                                  confirm={() => {
                                    setValue(`topic.${topicIndex}.items.${itemIndex}.label`, label)
                                  }}
                                >
                                  <Button>{item.label?.title ? item.label.title : 'Tag'}</Button>
                                </ConfirmDialog>
                              )
                            }}
                          />
                        )}
                      />
                    </div>
                  )}
                  {(topic.questionType === TopicType.FillIn || topic.questionType === TopicType.ShortAnswer) && (
                    <TextField fullWidth disabled minRows={3} multiline />
                  )}
                </Grid>
              </Grid>
              {(topic.questionType === TopicType.Single || topic.questionType === TopicType.Multiple) && (
                <div className='flex flex-col justify-between border-is pt-1 pb-1'>
                  {topics.find(c => c.refId === item._id) !== undefined ? (
                    <Button
                      onClick={() => {
                        documentToScroll(topics.find(c => c.refId === item._id)?._id as string)
                      }}
                    >
                      {topics.find(c => c.refId === item._id)?.title || `${topicIndex + 1}-${itemIndex + 1}`}
                    </Button>
                  ) : (
                    items.length > 1 && <DeleteButton id={item._id as string} items={items} replace={replace} />
                  )}
                  <AddOption append={topicAppend} refId={item._id} length={topic.items?.length || 1} sort={topic.sort}>
                    <IconButton>
                      <i className='ri-add-line' />
                    </IconButton>
                  </AddOption>
                </div>
              )}
            </div>
          ))}
          {(topic.questionType === TopicType.Single || topic.questionType === TopicType.Multiple) && (
            <div className='w-auto'>
              <Button variant='contained' startIcon={<i className='ri-add-line' />} onClick={handleAddTopicItem}>
                Add Choice
              </Button>
            </div>
          )}
        </>
      )}
    </>
  )
}

export default TopicItem
