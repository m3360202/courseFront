import SurveyView from '@/views/organization/survey/view'

const EnrollmentSurvey = ({ params }: { params: { surveyId: string } }) => <SurveyView surveyId={params.surveyId} />

export default EnrollmentSurvey
