import React, { useState } from 'react'
import { useOrganization } from '@/hooks/useOrganization'
import { Card, CardContent, Typography } from '@mui/material'

const Description = () => {
  const { organization } = useOrganization()
  const [showMap, setShowMap] = useState(true)

  return (
    <>
      <Card>
        <CardContent className='flex flex-col gap-6'>
          <Typography
            sx={{
              wordWrap: 'break-word',
              whiteSpace: 'pre-wrap',
              width: '100%',
              padding: '25px',
              '& img': {
                maxWidth: '100%',
                height: 'auto'
              },
              '& ol': {
                paddingInlineStart: '40px'
              }
            }}
            dangerouslySetInnerHTML={{
              __html: organization?.defineContent || '',
            }}
          />
        </CardContent>
      </Card>
      {(organization && organization.address) && (
        <Card sx={{ marginTop: '10px' }}>
          <CardContent className='flex flex-col gap-6'>
            <h3 style={{ wordWrap: 'break-word', whiteSpace: 'pre-wrap' }} >
              Location
            </h3>
            <div className='flex gap-2'>
              <i className='ri-map-pin-line text-xl text-textSecondary' />
              <Typography className='flex flex-col'>
                <span>{organization.address}</span>
              </Typography>
            </div>
            {/*gooogle map*/}
            {showMap && (
              <div className='flex gap-2 cursor-pointer' onClick={() => setShowMap(false)}>
                <Typography className='flex flex-col text-blue-400'>
                  <span>Close Map</span>
                </Typography>
                <i className='ri-arrow-up-s-line text-xl text-textSecondary text-blue-400' />
              </div>
            )}
            {!showMap && (
              <div className='flex gap-2 cursor-pointer' onClick={() => setShowMap(true)}>
                <Typography className='flex flex-col text-blue-400'>
                  <span>Show Map</span>
                </Typography>
                <i className='ri-arrow-down-s-line text-xl text-textSecondary text-blue-400' />
              </div>
            )}
            {showMap && (
              <div>
                <iframe
                  width='100%'
                  height='100%'
                  frameBorder='0'
                  title='map'
                  marginHeight={0}
                  marginWidth={0}
                  scrolling='no'
                  src={`https://maps.google.com/maps?width=100%&height=100%&hl=en&q=${organization.address}&ie=UTF8&t=&z=14&iwloc=B&output=embed`}
                  style={{
                    minHeight: 300,
                    filter: 'none'
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </>
  )
}

export default Description
