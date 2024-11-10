import SaveCourse from '@/views/course/component/SaveCourse'

const EditCourseApp = ({ params }: { params: { courseId: string } }) => <SaveCourse courseId={params.courseId} />

export default EditCourseApp
