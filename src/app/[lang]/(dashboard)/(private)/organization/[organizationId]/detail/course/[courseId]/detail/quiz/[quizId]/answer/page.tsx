import AnswerQuiz from '@/views/course/detail/quiz/answer'

const AnswerQuizApp = ({ params }: { params: { quizId: string } }) => <AnswerQuiz quizId={params.quizId} />

export default AnswerQuizApp
