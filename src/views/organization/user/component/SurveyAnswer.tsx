import { formatUtcDateToDateTime } from '@/utils/date'
import { Box, Chip, Grid, Typography } from '@mui/material'

const SurveyAnswer = ({ answer }: { answer: any }) => {
  return (
    <Box style={{ padding: '10px 20px' }}>
      <Box sx={{ mt: '10px', mb: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography sx={{ fontWeight: 'bold', fontSize: '20px' }}>{answer?.enrollmentPlan?.title}</Typography>
        <Typography sx={{ color: '#1976d2', fontSize: '14px' }}>
          {formatUtcDateToDateTime(answer.createdAt || answer.postAt)}
        </Typography>
      </Box>

      {answer?.topic?.map((item: any) => (
        <Box key={item._id} mb={2} style={{ border: '#3fc9c3 1px dashed', borderRadius: '10px', padding: '10px 20px' }}>
          <Grid xs={12} sx={{ mt: '10px', mb: '10px' }}>
            <Typography sx={{ fontWeight: 'bold', fontSize: '16px', color: '#1976d2' }}>Q: {item.title}</Typography>
          </Grid>
          <Grid xs={12} sx={{ mt: '10px', mb: '10px' }}>
            <Typography sx={{ fontSize: '16px', color: '#3fc9c3' }}>A:{item.value?.join(' ')}</Typography>
          </Grid>
        </Box>
      ))}
      <Grid xs={12} sx={{ mt: '30px', mb: '10px', fontWeight: 'bold' }}>
        <h3>Tags assigned to student</h3>
      </Grid>
      <Grid xs={12} sx={{ display: 'flex', justifyContent: 'flex-start' }}>
        {answer?.useranswer?.[0]?.labels
          ?.filter((c: any) => c.title)
          .map((item: any, index: number) => (
            <Chip
              size='small'
              key={index}
              label={item.title}
              color='success'
              sx={{
                height: 20,
                fontSize: '0.875rem',
                fontWeight: 600,
                borderRadius: '5px',
                textTransform: 'capitalize',
                '& .MuiChip-label': { mt: -0.25 },
                ml: 10
              }}
            />
          ))}
      </Grid>
    </Box>
  )
}

export default SurveyAnswer
