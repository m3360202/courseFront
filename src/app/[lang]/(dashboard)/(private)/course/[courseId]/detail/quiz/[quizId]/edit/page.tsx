import SaveQuiz from '@/views/course/detail/quiz/component/SaveQuiz'

const EditQuizApp = ({ params }: { params: { quizId: string } }) => <SaveQuiz quizId={params.quizId} />

export default EditQuizApp
