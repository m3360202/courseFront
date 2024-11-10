import SavePlan from '@/views/organization/plan/component/SavePlan'

const EnrollmentPlan = ({ params }: { params: { planId: string } }) => <SavePlan planId={params.planId} />

export default EnrollmentPlan
