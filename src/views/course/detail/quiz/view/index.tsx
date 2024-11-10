'use client'

// MUI Imports
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'

// Components Imports
import { useCourse, useEditCourseRole } from '@/hooks/useCourse'
import { BASE_URL, FILE_PATH } from '@/types'
import { useUser } from '@/hooks/useGlobal'
import Title from '@/components/title'
import { useEffect, useState } from 'react'
import { getLocalizedUrl } from '@/utils/i18n'
import { Locale } from '@/configs/i18n'
import { useParams, useRouter } from 'next/navigation'
import PermissionButton from '@/components/buttons/PermissionButton'
import { useDictionary } from '@/hooks/useDictionary'
import Link from 'next/link'
import { UserTable } from '@/types/user/UserTable'
import LoadingButton from '@mui/lab/LoadingButton'
import { error, success } from '@/utils/toasts'
import ConfirmDialog from '@/components/confirm'
import ShareContent from '../../../component/ShareContent'
import {
  Button,
  Chip,
  FormControl,
  FormControlLabel,
  Grid,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField
} from '@mui/material'
import documentToScroll from '@/utils/documentToScroll'

import delay from '@/utils/delay'

import { Quiz } from '@/types/course/quiz'
import { getQuiz } from '@/api/course/quiz/getQuiz'
import deleteQuiz from '@/api/course/quiz/deleteQuiz'
import { TopicType } from '@/types/course/quiz/topic'
import columns from '../component/columns'
import StudentList from '../component/StudentList'
import { Worker, Viewer } from '@react-pdf-viewer/core'
import '@react-pdf-viewer/default-layout/lib/styles/index.css'

// Import styles
import '@react-pdf-viewer/core/lib/styles/index.css'
import Statistics from '../component/Statistics'
import { DocumentProps, DocumentType } from '@/types/document'
import { getLibraryQuiz } from '@/api/organization/library/quiz/getQuiz'

const ViewQuiz = ({
  quizId,
  organizationId,
  documentType = DocumentType.Course
}: { quizId: string } & DocumentProps) => {
  //States
  const [data, setData] = useState<Quiz | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Hooks
  const { lang: locale } = useParams()
  const { courseId, setBackUrl } = useCourse()
  const user = useUser()
  const editCourseRole = useEditCourseRole()
  const dictionary = useDictionary()
  const { push } = useRouter()

  //Vars
  const items = columns(data)

  useEffect(() => {
    const loadQuiz = async () => {
      if (user && quizId) {
        switch (documentType) {
          case DocumentType.Organization:
            if (organizationId) {
              const { data: orgData } = await getLibraryQuiz(user, organizationId as string, quizId)
              setData(orgData)
            }
            break
          default:
            if (courseId) {
              const { data } = await getQuiz(user, courseId, quizId)
              setData(data)
            }
            break
        }
      }
    }
    loadQuiz()
  }, [user, courseId, quizId, organizationId, documentType])

  useEffect(() => {
    courseId && setBackUrl([getLocalizedUrl(`/course/${courseId}/detail/quiz`, locale as Locale)])

    return () => {
      setBackUrl(null)
    }
  }, [user, courseId])

  const handleDelete = async () => {
    try {
      setDeleteLoading(true)
      await deleteQuiz(user as UserTable, courseId as string, quizId)
      success(`${dictionary.common.delete} ${dictionary.common.successful}`)
      delay(() => push(`/course/${courseId}/detail/quiz`), 500)
    } catch (err) {
      error((error as unknown as { message: string })?.message)
    } finally {
      setDeleteLoading(false)
    }
  }

  const buttons =
    documentType === DocumentType.Course
      ? [
        <PermissionButton key={'edit'} isShow={editCourseRole}>
          <Button
            size='small'
            onClick={() => {
              documentToScroll('studentList')
            }}
          >
            Student list
          </Button>
        </PermissionButton>,
        <PermissionButton key={'edit'} isShow={editCourseRole}>
          <Button
            size='small'
            component={Link}
            href={getLocalizedUrl(
              `/course/${courseId}/detail/quiz/${quizId}/edit/${data?.quizType == 1 ? 'pdf' : ''}`,
              locale as Locale
            )}
          >
            Edit
          </Button>
        </PermissionButton>,
        <PermissionButton key={'delete'} isShow={editCourseRole}>
          <ConfirmDialog
            title={dictionary.common.delete}
            confirm={async () => {
              await handleDelete()
            }}
          >
            <LoadingButton loading={deleteLoading}>Delete</LoadingButton>
          </ConfirmDialog>
        </PermissionButton>
      ]
      : undefined

  return (
    <>
      <ShareContent about='quiz' title={data?.title} items={items} buttons={buttons}>
        <Divider />
        <div className='flex flex-col gap-4'>
          <Typography variant='h5'>Topics</Typography>
        </div>
        <Divider />
        <Grid container spacing={4}>
          {data?.quizType === 1 && data.file && data.file.length > 0 && (
            <Grid
              item
              xs={9}
              sx={{
                width: '100%',
                position: 'relative',
                overflow: 'auto',
                height: '100vh',
                overflowY: 'hidden'
              }}
            >
              <Worker workerUrl='https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js'>
                <div style={{ height: `100vh` }}>
                  <Viewer
                    fileUrl={FILE_PATH + data.file[0].temporary}
                  // plugins={[defaultLayoutPluginInstance]}
                  />
                </div>
              </Worker>
            </Grid>
          )}
          <Grid item xs={data?.quizType === 1 ? 3 : 12}>
            {data?.topic?.map((topic, index) => (
              <div key={topic._id} className='flex gap-4 items-baseline'>
                <Title variant='h5'>
                  {index + 1}.{topic.title}
                </Title>
                {(topic.questionType === TopicType.Single || topic.questionType === TopicType.TrueOrFalse) && (
                  <RadioGroup
                    aria-disabled
                    defaultValue={topic.value?.join()}
                    name='basic-radio'
                    aria-label='basic-radio'
                  >
                    {topic.items?.map(item => (
                      <div key={item.title} className='flex gap-2'>
                        <FormControlLabel
                          key={item.title}
                          disabled
                          value={item.title}
                          control={<Radio />}
                          label={item.title}
                        />
                        {item.file && <img src={BASE_URL + item.file} alt='' width={100} height={55} />}
                      </div>
                    ))}
                  </RadioGroup>
                )}
                {topic.questionType === TopicType.Multiple && (
                  <FormControl fullWidth>
                    <Select
                      multiple
                      value={topic.value}
                      renderValue={selected => (
                        <div className='flex flex-wrap gap-2'>
                          {(selected as string[]).map(value => (
                            <Chip
                              key={value}
                              clickable
                              deleteIcon={
                                <i className='ri-close-circle-fill' onMouseDown={event => event.stopPropagation()} />
                              }
                              size='small'
                              label={value}
                            />
                          ))}
                        </div>
                      )}
                    >
                      {topic.items?.map(item => (
                        <MenuItem key={item.title} value={item.title} sx={{ display: 'flex', gap: 4 }}>
                          {item.title} {item.file && <img src={BASE_URL + item.file} alt='' width={100} height={55} />}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
                {(topic.questionType === TopicType.FillIn || topic.questionType === TopicType.ShortAnswer) && (
                  <TextField fullWidth value={topic.value?.join()} minRows={3} disabled />
                )}
              </div>
            ))}
          </Grid>
        </Grid>
      </ShareContent>
      {documentType === DocumentType.Course && (
        <>
          <div id='studentList' className=' mt-4'>
            <StudentList quizId={quizId} />
          </div>
          <div id='statistics' className=' mt-4'>
            <Statistics quizId={quizId} />
          </div>
        </>
      )}
    </>
  )
}

export default ViewQuiz
