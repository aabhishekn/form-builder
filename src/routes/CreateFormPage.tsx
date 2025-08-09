import * as React from 'react'
import { Button, List, ListItem, ListItemText, Stack } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from '../app/store'
import { addTextField } from '../features/formBuilder/formSlice'

export default function CreateFormPage() {
  const dispatch = useDispatch<AppDispatch>()
  const fields = useSelector((s: RootState) => s.form.fields)

  return (
    <Stack spacing={2}>
      <Button variant="contained" onClick={() => dispatch(addTextField())}>
        Add text field
      </Button>

      <List dense>
        {fields.map((f) => (
          <ListItem key={f.id}>
            <ListItemText primary={f.label} secondary={`key: ${f.key} • type: ${f.type}`} />
          </ListItem>
        ))}
      </List>
    </Stack>
  )
}
