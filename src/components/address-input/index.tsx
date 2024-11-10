import React, { useEffect, useState } from 'react'

import { Autocomplete, TextField } from '@mui/material'

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY

interface AddressInputProps {
  value: string
  onChange: (newValue: string) => void
  label?: string
}

const AddressInput: React.FC<AddressInputProps> = ({ onChange, value, label = 'Address' }) => {
  const [input, setInput] = useState('')
  const [options, setOptions] = useState<string[]>([])
  const [scriptLoaded, setScriptLoaded] = useState(false) // State to track if script is loaded

  useEffect(() => {
    const scriptUrl = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places&language=en`
    const existingScript = document.querySelector(`script[src="${scriptUrl}"]`) as HTMLScriptElement

    if (!existingScript) {
      const script = document.createElement('script')

      script.src = scriptUrl
      script.async = true
      script.onload = () => setScriptLoaded(true)
      document.body.appendChild(script)
    } else {
      setScriptLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (input && scriptLoaded) {
      // @ts-ignore
      const autocomplete = new google.maps.places.AutocompleteService()

      autocomplete.getPlacePredictions(
        {
          input,
          componentRestrictions: { country: 'US' },
          language: 'en'
        },
        (predictions: any) => {
          if (predictions) {
            setOptions(predictions.map((prediction: any) => prediction.description))
          } else {
            setOptions([])
          }
        }
      )
    } else {
      setOptions([])
    }
  }, [input, scriptLoaded])

  return (
    <Autocomplete
      value={value}
      onChange={(_, newValue) => {
        onChange(newValue || '')
      }}
      onInputChange={(_, newInputValue) => {
        setInput(newInputValue)
      }}
      options={options}
      renderInput={params => <TextField {...params} label={label} variant='outlined' fullWidth />}
      freeSolo={false}
    />
  )
}

export default AddressInput
