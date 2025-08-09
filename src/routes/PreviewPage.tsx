import * as React from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '../app/store'
import { Alert, Button, Stack, TextField } from '@mui/material'

export default function PreviewPage() {
  const fields = useSelector((s: RootState) => s.form.fields)
  const [values, setValues] = React.useState<Record<string, any>>({})

  // Reset form values whenever fields change
  React.useEffect(() => {
    const init: Record<string, any> = {}
    fields.forEach((f) => (init[f.key] = ''))
    setValues(init)
  }, [fields])

  if (!fields.length) {
    return <Alert severity="info">Go to Create and add fields first.</Alert>
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // For now, just show the filled values
    alert('Submitted:\n' + JSON.stringify(values, null, 2))
  }

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={2}>
        {fields.map((f) => (
          <TextField
            key={f.id}
            label={f.label || 'Untitled'}
            value={values[f.key] ?? ''}
            onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
            fullWidth
          />
        ))}
        <Button type="submit" variant="contained">Submit</Button>
      </Stack>
    </form>
  )
}
