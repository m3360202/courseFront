import SaveSurvey from '@/views/organization/survey/component/SaveSurvey'

const EnrollmentSurvey = ({ params }: { params: { surveyId: string } }) => <SaveSurvey surveyId={params.surveyId} />

export default EnrollmentSurvey
