'use client'

import {
  Box,
  Card,
  CardContent,
  FormControlLabel,
  Grid,
  InputAdornment,
  Radio,
  RadioGroup,
  TextField,
  Typography
} from '@mui/material'

import LoadingButton from '@mui/lab/LoadingButton'

import Title from '@/components/title'

import { CustomDivider } from '@/components/divider'
import { TextAlign } from '@/types'

import FormLayout from '@/components/layout/FormLayout'
import { useEffect, useState } from 'react'
import { Enrollment, PaymentType } from '@/types/organization/enrollment'
import { useUser } from '@/hooks/useGlobal'
import { getEnrollmentDetail } from '@/api/organization/enrollment/getEnrollmentDetail'
import BackdropLoading from '@/components/backdrop'
import ConfirmDialog from '@/components/confirm'
import { error } from '@/utils/toasts'
import { UserTable } from '@/types/user/UserTable'
import { createPayment, handlePayment } from '@/utils/payment'
import { useParams } from 'next/navigation'
import { pushOrganizationUser } from '@/api/organization/user/addOrganizationUser'
import { Organization } from '@/types/organization'
import { unknown } from 'valibot'

const Payment = ({ organization }: { organization?: Organization }) => {
  //States
  const [data, setData] = useState<Enrollment>()
  const [loading, setLoading] = useState(true)
  const [amount, setAmount] = useState<number>()
  const [customizeAmount, setCustomizeAmount] = useState<number>()
  const [company, setCompany] = useState<string>()
  const [legalName, setLegalName] = useState<string>()
  const [donationName, setDonationName] = useState<string>()
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [donateLaterLoading, setDonateLaterLoading] = useState(false)

  // Hooks
  const user = useUser()
  const { organizationId, shareId } = useParams()

  useEffect(() => {
    const loadEnrollment = async () => {
      if (shareId && user) {
        const { data } = await getEnrollmentDetail(user, shareId as string)
        setData(data)
        setLoading(false)
        if (data.paymentType === PaymentType.Fixed) setAmount(data?.amount)
      }
    }

    loadEnrollment()
  }, [shareId, user])

  useEffect(() => {
    if (organization) setLoading(false)
  }, [organization])

  const payment = async () => {
    const money = amount || customizeAmount
    if (!money) {
      error('Amount is invalid')

      return
    }

    setPaymentLoading(true)

    await handlePayment(
      user as UserTable,
      user?._id as string,
      user?.email as string,
      organizationId as string,
      shareId as string,
      {
        title: organization ? `${user?.name}'s donation` : (data?.title as string),
        type: organization ? '2' : (data?.paymentType?.toString() as string)
      },
      money,
      organization ? true : undefined,
      organization ? 2 : undefined,
      undefined,
      organization ? organization.name : undefined
    )
    setPaymentLoading(false)
  }

  const handleDonateLater = async () => {
    setDonateLaterLoading(true)
    try {
      await pushOrganizationUser(user as UserTable, organizationId as string, shareId as string)
      await createPayment(
        user as UserTable,
        organizationId as string,
        shareId as string,
        {
          title: data?.title as string,
          type: data?.paymentType?.toString() as string
        },
        company,
        legalName,
        donationName
      )
      window.location.href = '/organization/home'
    } catch {
      error('error!')
    } finally {
      setDonateLaterLoading(false)
    }
  }

  if (loading) return <BackdropLoading loading={loading} />

  return (
    <FormLayout className='md:w-[43%]'>
      <Card>
        <CardContent>
          <Grid container spacing={5}>
            <Grid item xs={12}>
              <CustomDivider textAlign={TextAlign.Center}>
                <Title variant='h5'>Payment</Title>
              </CustomDivider>
            </Grid>
            <Grid item xs={12}>
              <Typography variant='h5'>
                {data?.paymentType === PaymentType.Flexible ? 'Donation' : 'You will need to pay for this enrollment'}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              {data?.paymentType === PaymentType.Flexible || organization ? (
                <Typography variant='caption'>
                  This organization will not charge you any fees, but you can still donate to show your appreciation for
                  their work.
                </Typography>
              ) : (
                <Typography variant='caption' sx={{ fontSize: '14px' }}>
                  This institution charges{' '}
                  <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#1976d2' }}>${data?.amount}</span> for
                  each student who joins and you need to pay the fees below.
                </Typography>
              )}
            </Grid>
            <Grid item xs={12}>
              {(data?.paymentType === PaymentType.Flexible || organization) &&
                ((data?.donationTiers && data?.donationTiers.length) ||
                  (organization?.donationTiers && organization.donationTiers.length) ? (
                  <RadioGroup
                    value={amount}
                    onChange={e => {
                      setAmount(parseFloat(e.target.value))
                      setCustomizeAmount(undefined)
                    }}
                  >
                    {(data?.donationTiers || organization?.donationTiers)?.filter(c => c.amount)?.map(tier => (
                      <>
                        <FormControlLabel
                          value={tier.amount}
                          control={<Radio checked={amount === tier.amount} />}
                          label={<Title variant='h5'>${tier.amount}</Title>}
                          sx={{ display: 'flex', alignItems: 'center' }}
                        />
                        <Typography
                          style={{
                            whiteSpace: 'pre-wrap',
                            fontSize: '0.75rem',
                            fontWeight: '400',
                            color: '#999',
                            margin: '5px 30px'
                          }}
                        >
                          {tier.description}
                        </Typography>
                      </>
                    ))}
                    {(data?.customizeDonate || organization?.isCustomizeDonate) && (
                      <Box sx={{ marginBottom: '40px' }}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            marginLeft: '-10px',
                            marginTop: '40px',
                            marginBottom: '20px'
                          }}
                        >
                          <Radio value={-1} checked={customizeAmount || amount === -1 ? true : false} />
                          <Typography sx={{ marginRight: '8px', fontWeight: 'bold' }}>Others</Typography>
                          <TextField
                            fullWidth
                            value={customizeAmount ? customizeAmount : unknown}
                            sx={{ width: '50%' }}
                            type='number'
                            InputProps={{
                              endAdornment: <InputAdornment position='start'>$US</InputAdornment>
                            }}
                            inputProps={{ min: 0 }}
                            onChange={e => {
                              const value = parseFloat(e.target.value)
                              setCustomizeAmount(value)
                              setAmount(undefined)
                            }}
                          />
                        </Box>
                      </Box>
                    )}
                  </RadioGroup>
                ) : (
                  <TextField
                    fullWidth
                    value={amount}
                    sx={{ width: '50%' }}
                    type='number'
                    InputProps={{
                      endAdornment: <InputAdornment position='start'>$US</InputAdornment>
                    }}
                    inputProps={{ min: 0 }}
                    onChange={e => {
                      setAmount(parseFloat(e.target.value))
                    }}
                  />
                ))}
            </Grid>

            {(data?.paymentType === PaymentType.Flexible || organization) && (
              <>
                <Grid item xs={12}>
                  <CustomDivider>
                    <Title variant='h5'>Addtional</Title>
                  </CustomDivider>
                </Grid>
                <Grid item xs={12}>
                  <div className='flex flex-col gap-4'>
                    <TextField
                      label={`Your company name (Optional)`}
                      fullWidth
                      value={company}
                      inputProps={{ min: 0 }}
                      onChange={e => {
                        setCompany(e.target.value)
                      }}
                    />
                    <TextField
                      label={`Your legal name (Optional)`}
                      fullWidth
                      value={legalName}
                      inputProps={{ min: 0 }}
                      onChange={e => {
                        setLegalName(e.target.value)
                      }}
                    />
                    <TextField
                      label={`Name for donation public listing (If needed) `}
                      fullWidth
                      value={donationName}
                      inputProps={{ min: 0 }}
                      onChange={e => {
                        setDonationName(e.target.value)
                      }}
                    />
                  </div>
                </Grid>
              </>
            )}
            {data?.paymentType === PaymentType.Flexible && (
              <Grid item xs={12}>
                <Typography style={{ whiteSpace: 'pre-wrap', fontSize: '0.75rem', fontWeight: '400', color: '#999' }}>
                  {data?.paymentDescription}
                </Typography>
              </Grid>
            )}
            <Grid item xs={12} mt={10} className='flex justify-center gap-8'>
              <LoadingButton variant='contained' loading={paymentLoading} onClick={payment}>
                Confirm
              </LoadingButton>
              {data?.paymentType === PaymentType.Flexible && data?.donateLater && (
                <ConfirmDialog title='Donate Later' confirm={handleDonateLater}>
                  <LoadingButton variant='outlined' loading={donateLaterLoading}>
                    Donate Later
                  </LoadingButton>
                </ConfirmDialog>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </FormLayout>
  )
}

export default Payment
