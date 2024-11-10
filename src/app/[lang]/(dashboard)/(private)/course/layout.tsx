'use client'

import type { ReactNode } from 'react'

import CourseProvider from '@/contexts/CourseProvider/CourseProvider'

const CourseLayout = ({ children }: { children: ReactNode }) => {


  return <CourseProvider>{children}</CourseProvider>
}

export default CourseLayout
