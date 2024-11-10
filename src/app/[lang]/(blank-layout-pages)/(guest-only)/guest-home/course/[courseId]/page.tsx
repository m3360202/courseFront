'use client'
import { useParams } from "next/navigation"
import CourseView from "@/views/course/detail"
import CourseDetailLayout from "@/components/layout/CourseDetailLayout"
import { useCourse } from "@/hooks/useCourse"
import { useEffect } from "react"



const HomePage = () => {
    const { courseId } = useParams()
    const { refreshCourse } = useCourse()

    const loadCourse = async () => {
        if (courseId && refreshCourse && typeof refreshCourse === 'function') {
            await refreshCourse(null, courseId as string)
        }
    }

    useEffect(() => {
        loadCourse()
    }, [courseId, refreshCourse])

    return <CourseDetailLayout> <CourseView courseId={courseId as string} /> </CourseDetailLayout>
}

export default HomePage
