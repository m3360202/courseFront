'use client'

import CourseDetailLayout from '@/components/layout/CourseDetailLayout'
import { ReactNode } from 'react'

const CourseLayout = ({ children }: { children: ReactNode }) => {
  return (
    <CourseDetailLayout>
      <>{children}</>
    </CourseDetailLayout>
  )
}

export default CourseLayout
