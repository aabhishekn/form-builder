import * as React from 'react'
import { Button, List, ListItemButton, ListItemText, Stack, Paper, Box, TextField, Typography } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from '../app/store'
import { addTextField, updateField } from '../features/formBuilder/formSlice'

export default function CreateFormPage() {
  const dispatch = useDispatch<AppDispatch>()
  const fields = useSelector((s: RootState) => s.form.fields)
  const [selectedId, setSelectedId] = React.useState<string | null>(fields[0]?.id ?? null)

  React.useEffect(() => {
    if (fields.length && !selectedId) setSelectedId(fields[0].id)
  }, [fields, selectedId])

  const selected = fields.find((f) => f.id === selectedId) || null

  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
      {/* Left: Add button + list */}
      <Paper sx={{ p: 2, flex: 1 }}>
        <Button variant="contained" onClick={() => dispatch(addTextField())}>
          Add text field
        </Button>

        <List dense sx={{ mt: 2 }}>
          {fields.map((f) => (
            <ListItemButton
              key={f.id}
              selected={selectedId === f.id}
              onClick={() => setSelectedId(f.id)}
            >
              <ListItemText primary={f.label || 'Untitled'} secondary={`key: ${f.key} • type: ${f.type}`} />
            </ListItemButton>
          ))}
          {!fields.length && (
            <Box sx={{ color: 'text.secondary', p: 1 }}>Click “Add text field” to start.</Box>
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
              label="Key (used later in Preview)"
              value={selected.key}
              onChange={(e) =>
                dispatch(updateField({ id: selected.id, patch: { key: e.target.value } }))
              }
              fullWidth
            />
          </Stack>
        ) : (
          <Box sx={{ color: 'text.secondary' }}>Select a field from the list to edit.</Box>
        )}
      </Paper>
    </Stack>
  )
}
