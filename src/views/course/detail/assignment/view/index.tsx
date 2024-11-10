'use client'

// MUI Imports
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'

// Components Imports
import { useCourse, useEditCourseRole } from '@/hooks/useCourse'
import { DetailItem } from '@/types'
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
import { Button } from '@mui/material'
import documentToScroll from '@/utils/documentToScroll'
import { getAssignment } from '@/api/course/assignment/getAssignment'
import { Assignment } from '@/types/course/assignment'
import format from '@/utils/format'
import delay from '@/utils/delay'
import { deleteAssignment } from '@/api/course/assignment/deleteAssignment'
import FileList from '@/components/file-upload/FileList'
import StudentScore from '../component/StudentScore'
import { getStudentList } from '@/api/course/assignment/getAssignmentStudents'
import FileUpload from '@/components/file-upload'
import { addAnswer } from '@/api/course/assignment/addAnswer'
import { ViewIcon } from '@/components/buttons'
import { FileType } from '@/types/file/file'
import { viewFile } from '@/utils/document/download'
import { DocumentProps, DocumentType } from '@/types/document'
import { getLibraryAssignment } from '@/api/organization/library/assignment/getAssignment'

const ViewAssignment = ({
  assignmentId,
  organizationId,
  documentType = DocumentType.Course
}: { assignmentId: string } & DocumentProps) => {
  //States
  const [data, setData] = useState<Assignment | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [isEnded, setIsEnd] = useState(false)
  const [isSubmit, setIsSubmit] = useState(false)
  const [isScored, setIsScored] = useState(false)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [files, setFiles] = useState<FileType[]>()

  // Hooks
  const { lang: locale } = useParams()
  const { courseId, setBackUrl, addActionButtons } = useCourse()
  const user = useUser()
  const dictionary = useDictionary()
  const { push } = useRouter()
  const editCourseRole = useEditCourseRole()

  useEffect(() => {
    const loadStudentList = async () => {
      if (user && courseId && assignmentId && !editCourseRole) {
        setLoading(true)
        const { data } = await getStudentList(user, courseId, assignmentId)
        const student = data?.students?.find(c => c._id === user._id)
        setIsSubmit(student ? student.isSubmit === true : false)
        setIsScored(student ? student.score !== undefined : false)
        setFiles(student?.files)
        setLoading(false)
      }
    }
    loadStudentList()
  }, [user, courseId, assignmentId, editCourseRole, uploadLoading])

  //Vars
  const items: DetailItem[] = [
    {
      title: 'Title',
      value: data?.title,
      col: 1
    },
    {
      title: 'Posted on',
      value: format(data?.postAt, 'yyyy/MM/DD'),
      col: 1
    },
    {
      title: 'Deadline',
      value: data?.endDate && format(data.endDate),
      col: 1
    },
    {
      title: (
        <Typography variant='h5' color={'error'}>
          The submission time has ended
        </Typography>
      ),
      col: 1,
      hidden: !isEnded
    }
  ]

  useEffect(() => {
    const loadAssignment = async () => {
      if (user && assignmentId) {
        switch (documentType) {
          case DocumentType.Organization:
            if (organizationId) {
              const { data } = await getLibraryAssignment(user, organizationId, assignmentId)
              setData(data)
            }
            break
          default:
            if (courseId) {
              const { data } = await getAssignment(user, courseId, assignmentId)
              setData(data)
            }
            break
        }
        if (data?.endDate && new Date(data?.endDate) < new Date()) {
          setIsEnd(true)
        }
      }
    }
    loadAssignment()
  }, [user, courseId, assignmentId])

  const submitAnswerButton = () => {
    if (loading) return <></>

    let title = '...'
    if (isEnded || isScored) title = 'View answer'
    else {
      if (isSubmit) title = 'Resubmit'
      else title = 'Submit answer'
    }
    if (title === 'View answer')
      return (
        <Button
          variant='contained'
          startIcon={<ViewIcon className='bg-white' />}
          onClick={() => {
            const file = files && files.length > 0 ? files[0] : undefined
            viewFile(file)
          }}
        >
          View answer
        </Button>
      )
    else
      return (
        <FileUpload
          title={title}
          loading={uploadLoading}
          variant='contained'
          color='primary'
          handleUploadFiles={handleUploadFiles}
        />
      )
  }

  useEffect(() => {
    courseId && setBackUrl([getLocalizedUrl(`/course/${courseId}/detail/assignment`, locale as Locale)])
    user && addActionButtons([
      <PermissionButton key='valid' isShow={!editCourseRole && !loading}>
        {submitAnswerButton()}
      </PermissionButton>
    ])

    return () => {
      setBackUrl(null)
      addActionButtons(null)
    }
  }, [user, courseId, isEnded, isSubmit, isScored])

  const handleDelete = async () => {
    try {
      setDeleteLoading(true)
      await deleteAssignment(user as UserTable, courseId as string, assignmentId)
      success(`${dictionary.common.delete} ${dictionary.common.successful}`)
      delay(() => push(`/course/${courseId}/detail/assignment`), 500)
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
            href={getLocalizedUrl(`/course/${courseId}/detail/assignment/${assignmentId}/edit`, locale as Locale)}
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

  const handleUploadFiles = async (fileList: File | File[]) => {
    setUploadLoading(true)
    await addAnswer(user as UserTable, courseId as string, assignmentId as string, fileList as File[])
    setUploadLoading(false)
  }

  return (
    <>
      <ShareContent about='assignment' title={data?.title} items={items} buttons={buttons}>
        <Divider />
        <div className='flex flex-col gap-4'>
          <Typography variant='h5'>Attachment</Typography>
          <FileList files={data?.files} />
        </div>
        <Divider />
        <div className='flex flex-col gap-4'>
          <Typography variant='h5'>Description</Typography>
          <Title dangerouslySetInnerHTML={{ __html: data?.description || '' }} />
        </div>
        <Divider />
      </ShareContent>
      {documentType === DocumentType.Course && (
        <div id='studentList' className=' mt-4'>
          <StudentScore
            assignmentId={assignmentId}
            totalScore={data?.totalScore as number}
            uploadLoading={uploadLoading}
            isSubmit={isSubmit}
            isScored={isScored}
          />
        </div>
      )}
    </>
  )
}

export default ViewAssignment
