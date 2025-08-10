import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from '../app/store'
import { loadSaved, deleteSaved } from '../features/formBuilder/formSlice'
import { Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Stack } from '@mui/material'
import { useNavigate } from 'react-router-dom'

export default function MyFormsPage() {
  const saved = useSelector((s: RootState) => s.form.saved)
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()

  const openForm = (id: string) => {
    dispatch(loadSaved(id))
    navigate('/preview')
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>Saved forms</Typography>
      {saved.length === 0 ? (
        <Typography color="text.secondary">Nothing saved yet. Go to Create and click Save.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {saved.map((f) => (
                <TableRow key={f.id} hover>
                  <TableCell>{f.name}</TableCell>
                  <TableCell title={f.createdAt}>{new Date(f.createdAt).toLocaleString()}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button size="small" onClick={() => openForm(f.id)}>Open</Button>
                      <Button size="small" color="error" onClick={() => dispatch(deleteSaved(f.id))}>Delete</Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  )
}
