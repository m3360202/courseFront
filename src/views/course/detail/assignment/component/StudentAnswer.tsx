import FileList from '@/components/file-upload/FileList'
import Title from '@/components/title'
import { FileType } from '@/types/file/file'
import format from '@/utils/format'
import { Card, CardContent, CardHeader } from '@mui/material'

const StudentAnswer = ({
  files,
  isSubmit,
  isScored,
  score,
  submitTime
}: {
  files?: FileType[]
  isSubmit?: boolean
  isScored?: boolean
  score?: number
  submitTime?: string
}) => {
  return (
    <Card>
      <CardHeader
        title={
          <div className='flex gap-2 flex-col'>
            <Title variant='h5'>My answer</Title>
            {isSubmit && (<div className='flex flex-col gap-2'>
              <Title variant='h5' color={'error'}>
                You have already submitted
              </Title>
              <Title variant='h5' color={'error'}>
                Submit time: {format(submitTime)}
              </Title>
            </div>
            )}
            {isScored && (
              <Title variant='h5' color={'error'}>
                Your total score: {score}
              </Title>
            )}

          </div>
        }
      ></CardHeader>
      <CardContent>
        <FileList files={files} />
      </CardContent>
    </Card>
  )
}

export default StudentAnswer
