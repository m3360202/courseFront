// MUI Imports
import Grid from '@mui/material/Grid'

// Component Imports
import AboutOverview from './AboutOverview'
// 


const ProfileTab = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <AboutOverview />
      </Grid>
      {/* <Grid item lg={4} md={5} xs={12}>
        <AboutOverview  />
      </Grid> */}
      {/* <Grid item lg={8} md={7} xs={12}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Experienceline />
          </Grid>
        </Grid>
      </Grid> */}
    </Grid>
  )
}

export default ProfileTab
