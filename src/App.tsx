import * as React from 'react'
import { AppBar, Box, Button, Container, Toolbar } from '@mui/material'
import { NavLink, Route, Routes, Navigate, useLocation } from 'react-router-dom'
import CreateFormPage from './routes/CreateFormPage'
import PreviewPage from './routes/PreviewPage'
import MyFormsPage from './routes/MyFormsPage'

const LinkButton: React.FC<{ to: string; label: string }> = ({ to, label }) => {
  const location = useLocation()
  const isActive = location.pathname === to
  return (
    <Button
      component={NavLink}
      to={to}
      variant={isActive ? 'contained' : 'text'}
      color={isActive ? 'primary' : 'inherit'}
      sx={{ mr: 1 }}
    >
      {label}
    </Button>
  )
}

export default function App() {
  return (
    <Box sx={{ minHeight: '100vh' }}>
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar>
          <Box sx={{ fontWeight: 700, mr: 2 }}>Form Builder</Box>
          <LinkButton to="/create" label="Create" />
          <LinkButton to="/preview" label="Preview" />
          <LinkButton to="/myforms" label="Saved forms" />
        </Toolbar>
      </AppBar>
      <Container sx={{ py: 3 }}>
        <Routes>
          <Route path="/" element={<Navigate to="/create" replace />} />
          <Route path="/create" element={<CreateFormPage />} />
          <Route path="/preview" element={<PreviewPage />} />
          <Route path="/myforms" element={<MyFormsPage />} />
          <Route path="*" element={<Navigate to="/create" replace />} />
        </Routes>
      </Container>
    </Box>
  )
}
