import PlanView from '@/views/organization/plan/view'

const EnrollmentSurvey = ({ params }: { params: { planId: string } }) => <PlanView planId={params.planId} />

export default EnrollmentSurvey
