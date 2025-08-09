import * as React from 'react'
import {
  Button, List, ListItemButton, ListItemText, Stack, Paper, Box, TextField, Typography,
  FormControlLabel, Checkbox, IconButton
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from '../app/store'
import { addField, updateField, setFormName, saveCurrent } from '../features/formBuilder/formSlice'

export default function CreateFormPage() {
  const dispatch = useDispatch<AppDispatch>()
  const fields = useSelector((s: RootState) => s.form.fields)
  const formName = useSelector((s: RootState) => s.form.formName)
  const [selectedId, setSelectedId] = React.useState<string | null>(fields[0]?.id ?? null)

  React.useEffect(() => {
    if (fields.length && !selectedId) setSelectedId(fields[0].id)
  }, [fields, selectedId])

  const selected = fields.find((f) => f.id === selectedId) || null

  const toggleValidation = (rule: 'required' | 'email') => {
    if (!selected) return
    const set = new Set(selected.validations ?? [])
    if (set.has(rule)) set.delete(rule)
    else set.add(rule)
    dispatch(updateField({ id: selected.id, patch: { validations: Array.from(set) } }))
  }

  const updateOption = (i: number, patch: { label?: string; value?: string }) => {
    if (!selected || !selected.options) return
    const next = [...selected.options]
    next[i] = { ...next[i], ...patch }
    dispatch(updateField({ id: selected.id, patch: { options: next } }))
  }
  const addOption = () => {
    if (!selected) return
    const opts = selected.options ?? []
    dispatch(updateField({
      id: selected.id,
      patch: { options: [...opts, { label: `Option ${opts.length + 1}`, value: `opt${opts.length + 1}` }] }
    }))
  }
  const removeOption = (i: number) => {
    if (!selected || !selected.options) return
    const next = selected.options.filter((_, idx) => idx !== i)
    dispatch(updateField({ id: selected.id, patch: { options: next } }))
  }

  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
      {/* Left: Add buttons + list */}
      <Paper sx={{ p: 2, flex: 1 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Button variant="contained" onClick={() => dispatch(addField('text'))}>Add text</Button>
          <Button variant="outlined" onClick={() => dispatch(addField('select'))}>Add dropdown</Button>
          <Box sx={{ flex: 1 }} />
          <TextField
            size="small"
            label="Form name"
            value={formName}
            onChange={(e) => dispatch(setFormName(e.target.value))}
            sx={{ width: 240 }}
          />
          <Button variant="outlined" onClick={() => dispatch(saveCurrent())} sx={{ ml: 1 }}>
            Save
          </Button>
        </Stack>

        <List dense sx={{ mt: 2 }}>
          {fields.map((f) => (
            <ListItemButton
              key={f.id}
              selected={selectedId === f.id}
              onClick={() => setSelectedId(f.id)}
            >
              <ListItemText primary={`${f.label || 'Untitled'} (${f.type})`} secondary={`key: ${f.key}`} />
            </ListItemButton>
          ))}
          {!fields.length && (
            <Box sx={{ color: 'text.secondary', p: 1 }}>Click “Add text” to start.</Box>
          )}
        </List>
      </Paper>

      {/* Right: Edit panel */}
      <Paper sx={{ p: 2, flex: 1 }}>
        {selected ? (
          <Stack spacing={2}>
            <Typography variant="h6">Edit field</Typography>

            <TextField
              label="Label"
              value={selected.label}
              onChange={(e) =>
                dispatch(updateField({ id: selected.id, patch: { label: e.target.value } }))
              }
              fullWidth
            />
            <TextField
              label="Key (used in Preview)"
              value={selected.key}
              onChange={(e) =>
                dispatch(updateField({ id: selected.id, patch: { key: e.target.value } }))
              }
              fullWidth
            />

            {/* Validation */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Validation</Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={(selected.validations ?? []).includes('required')}
                    onChange={() => toggleValidation('required')}
                  />
                }
                label="Required"
              />
              {selected.type === 'text' && (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={(selected.validations ?? []).includes('email')}
                      onChange={() => toggleValidation('email')}
                    />
                  }
                  label="Must be a valid email"
                />
              )}
            </Box>

            {/* Options for dropdown */}
            {selected.type === 'select' && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Options</Typography>
                <Stack spacing={1}>
                  {(selected.options ?? []).map((opt, i) => (
                    <Stack key={i} direction="row" spacing={1} alignItems="center">
                      <TextField
                        size="small"
                        label="Label"
                        value={opt.label}
                        onChange={(e) => updateOption(i, { label: e.target.value })}
                        fullWidth
                      />
                      <TextField
                        size="small"
                        label="Value"
                        value={opt.value}
                        onChange={(e) => updateOption(i, { value: e.target.value })}
                        fullWidth
                      />
                      <IconButton aria-label="delete" onClick={() => removeOption(i)}>
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  ))}
                  <Button onClick={addOption} variant="outlined" size="small">Add option</Button>
                </Stack>
              </Box>
            )}
          </Stack>
        ) : (
          <Box sx={{ color: 'text.secondary' }}>Select a field from the list to edit.</Box>
        )}
      </Paper>
    </Stack>
  )
}
