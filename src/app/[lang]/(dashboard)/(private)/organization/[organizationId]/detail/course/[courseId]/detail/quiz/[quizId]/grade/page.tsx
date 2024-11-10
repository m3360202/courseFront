import GradeQuiz from '@/views/course/detail/quiz/grade'

const GradeQuizApp = ({ params }: { params: { quizId: string } }) => <GradeQuiz quizId={params.quizId} />

export default GradeQuizApp
