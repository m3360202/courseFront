'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TimelineItem from '@mui/lab/TimelineItem'
import TimelineSeparator from '@mui/lab/TimelineSeparator'
import TimelineConnector from '@mui/lab/TimelineConnector'
import TimelineContent from '@mui/lab/TimelineContent'
import TimelineDot from '@mui/lab/TimelineDot'
import { styled } from '@mui/material/styles'
import MuiTimeline from '@mui/lab/Timeline'
import type { TimelineProps } from '@mui/lab/Timeline'

// Hooks Imports
import { useUser } from '@/hooks/useGlobal'

// Type Imports
import { FILE_PATH } from '@/types'

// Api Imports
import { getProfile } from '@/api/user/profile/getProfile'

import { formatDateToYYYYMMDD } from '@/utils/date'

// Styled Components
const Timeline = styled(MuiTimeline)<TimelineProps>({
  '& .MuiTimelineItem-root': {
    '&:before': {
      display: 'none'
    }
  }
})

interface File {
  temporary: string;
  final: string;
}

interface Experience {
  _id: string;
  title: string;
  from: Date;
  to: Date;
  description: string;
  files: File[];
  isShow: boolean;
  hashTag?: string | string[] | undefined;
  organization: string;
  isPresent: boolean;
}

type Experiences = Experience[] | undefined;

const Experienceline = () => {
  const user = useUser()
  const [expriences, setExpriences] = useState<Experiences>([])

  useEffect(() => {

    const fetchData = async () => {
      if (user) {
        const { profile } = await getProfile(user);
        setExpriences(profile?.experiences as Experiences);
      }
    }

    fetchData();
  }, [])

  return (
    <Card>
      <CardHeader
        title='Experience'
        avatar={<i className='ri-bar-chart-2-line text-textSecondary' />}
        titleTypographyProps={{ variant: 'h5' }}
      />
      <CardContent>
        <Timeline>
          {expriences && expriences.map((item: any, index: number) => (
            <TimelineItem key={index}>
              <TimelineSeparator>
                <TimelineDot color='primary' />
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent>
                <div className='flex items-center justify-between flex-wrap gap-x-4 pbe-1.5'>
                  <Typography className='font-medium' color='text.primary'>
                    {item.title}
                  </Typography>
                  <Typography variant='caption'>{formatDateToYYYYMMDD(item.from)} - {formatDateToYYYYMMDD(item.to)}</Typography>
                </div>
                <Typography className='mbe-2'>{item.description}.</Typography>
                <div className='flex'>
                  {item.files && item.files.map((file: any, i: number) => (
                    <div key={i} className='flex gap-2.5 items-center pli-2.5 bg-actionHover plb-[0.3125rem] rounded'>
                      <img alt='invoice.pdf' src='/images/icons/pdf-document.png' className='bs-5' />
                      <Typography
                        className='font-medium'
                        sx={{cursor: 'pointer'}}
                        onClick={() => {
                          window.open(FILE_PATH + file.temporary)
                        }}
                      >
                        {file.final}
                      </Typography>
                    </div>
                  ))}
                </div>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </CardContent>
    </Card>
  )
}

export default Experienceline
