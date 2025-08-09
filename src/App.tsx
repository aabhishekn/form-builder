// src/App.tsx
import * as React from 'react'
import {
  AppBar,
  Box,
  Button,
  Container,
  Toolbar,
  Typography,
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import ViewQuiltIcon from '@mui/icons-material/ViewQuilt'
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
      size="small"
      disableElevation
      sx={(theme) => ({
        textTransform: 'none',
        fontWeight: 600,
        px: 1.5,
        borderRadius: 2,
        transition: 'all .15s ease',
        ...(isActive
          ? {
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.35)}`,
              '&:hover': {
                bgcolor: 'primary.main',
              },
            }
          : {
              color: 'text.primary',
              '&:hover': { bgcolor: 'action.hover' },
            }),
      })}
    >
      {label}
    </Button>
  )
}

export default function App() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="sticky"
        elevation={0}
        color="transparent"
        sx={(theme) => ({
          borderBottom: '1px solid',
          borderColor: 'divider',
          backdropFilter: 'saturate(180%) blur(6px)',
          backgroundImage: `linear-gradient(90deg, ${alpha(
            theme.palette.primary.main,
            0.06
          )}, transparent)`,
        })}
      >
        <Toolbar sx={{ gap: 2 }}>
          {/* Brand */}
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 1.5 }}>
            <ViewQuiltIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography
              variant="h6"
              sx={{ fontWeight: 800, letterSpacing: 0.3, lineHeight: 1 }}
            >
              Form Builder
            </Typography>
          </Box>

          {/* Segmented nav */}
          <Box
            sx={{
              display: 'flex',
              gap: 0.5,
              p: 0.5,
              borderRadius: 2,
              bgcolor: 'action.hover',
            }}
          >
            <LinkButton to="/create" label="Create" />
            <LinkButton to="/preview" label="Preview" />
            <LinkButton to="/myforms" label="Saved forms" />
          </Box>

          {/* right spacer */}
          <Box sx={{ flexGrow: 1 }} />
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
