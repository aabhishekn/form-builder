import * as React from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '../app/store'
import { Alert, Button, Stack, TextField, MenuItem } from '@mui/material'

const emailRegex = /^(?:[a-zA-Z0-9_'^&\-]+(?:\.[a-zA-Z0-9_'^&\-]+)*|".+")@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/

export default function PreviewPage() {
  const fields = useSelector((s: RootState) => s.form.fields)
  const [values, setValues] = React.useState<Record<string, any>>({})
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  React.useEffect(() => {
    const init: Record<string, any> = {}
    fields.forEach((f) => (init[f.key] = ''))
    setValues(init)
    setErrors({})
  }, [fields])

  if (!fields.length) {
    return <Alert severity="info">Go to Create and add fields first.</Alert>
  }

  const validate = (): boolean => {
    const next: Record<string, string> = {}
    for (const f of fields) {
      const v = values[f.key]
      const rules = f.validations ?? []
      if (rules.includes('required') && (!v || String(v).trim() === '')) {
        next[f.key] = 'This field is required.'
        continue
      }
      if (f.type === 'text' && rules.includes('email') && v && !emailRegex.test(String(v))) {
        next[f.key] = 'Enter a valid email address.'
        continue
      }
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    alert('Submitted:\n' + JSON.stringify(values, null, 2))
  }

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={2}>
        {fields.map((f) =>
          f.type === 'select' ? (
            <TextField
              key={f.id}
              select
              label={f.label || 'Untitled'}
              value={values[f.key] ?? ''}
              onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
              error={!!errors[f.key]}
              helperText={errors[f.key] ?? ' '}
              fullWidth
            >
              {(f.options ?? []).map((o) => (
                <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
              ))}
            </TextField>
          ) : (
            <TextField
              key={f.id}
              label={f.label || 'Untitled'}
              value={values[f.key] ?? ''}
              onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
              error={!!errors[f.key]}
              helperText={errors[f.key] ?? ' '}
              fullWidth
            />
          )
        )}
        <Button type="submit" variant="contained">Submit</Button>
      </Stack>
    </form>
  )
}
