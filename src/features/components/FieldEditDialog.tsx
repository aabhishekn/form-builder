// src/features/formBuilder/components/FieldEditDialog.tsx
import * as React from 'react'
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import IconButton from '@mui/material/IconButton'
import type { Field, DerivedRecipe } from '../formBuilder/formSlice.ts'

type Props = {
  open: boolean
  field: Field | null
  allFields: Field[]
  onClose: () => void
  onPatch: (id: string, patch: Partial<Field>) => void
}

export default function FieldEditDialog({ open, field, allFields, onClose, onPatch }: Props) {
  if (!field) return null

  const toggleValidation = (rule: 'required' | 'email') => {
    const set = new Set<string>(field.validations ?? [])
    set.has(rule) ? set.delete(rule) : set.add(rule)
    onPatch(field.id, { validations: Array.from(set) as any })
  }

  const updateOption = (i: number, patch: { label?: string; value?: string }) => {
    const next = [...(field.options ?? [])]
    next[i] = { ...next[i], ...patch }
    onPatch(field.id, { options: next })
  }
  const addOption = () =>
    onPatch(field.id, {
      options: [...(field.options ?? []), { label: `Option ${(field.options ?? []).length + 1}`, value: `opt${(field.options ?? []).length + 1}` }],
    })
  const removeOption = (i: number) =>
    onPatch(field.id, { options: (field.options ?? []).filter((_, idx) => idx !== i) })

  // ----- Derived (recipes-only) -----
  const [recipe, setRecipe] = React.useState<DerivedRecipe | ''>(field.derived?.recipe ?? '')
  const [parents, setParents] = React.useState<string[]>(field.derived?.parents ?? [])

  React.useEffect(() => {
    setRecipe(field.derived?.recipe ?? '')
    setParents(field.derived?.parents ?? [])
  }, [field.id])

  const requiredCount = React.useMemo(() => {
    if (!recipe) return 0
    if (recipe === 'fullName' || recipe === 'daysBetweenDates') return 2
    return 1
  }, [recipe])

  const allowByType = (t: Field['type']) => {
    if (!recipe) return false
    if (recipe === 'ageFromDate' || recipe === 'daysBetweenDates') return t === 'date'
    if (recipe === 'uppercase' || recipe === 'lowercase' || recipe === 'fullName') return t === 'text' || t === 'textarea'
    return false
  }

  const candidates = allFields.filter((f) => f.id !== field.id && allowByType(f.type))
  const parentsErr =
    recipe && parents.length !== requiredCount ? `Pick exactly ${requiredCount} field${requiredCount > 1 ? 's' : ''}` : ''

  // commit recipe/parents into store
  React.useEffect(() => {
    if (!recipe) {
      onPatch(field.id, { derived: undefined })
      return
    }
    const trimmed = requiredCount > 0 ? parents.slice(0, requiredCount) : parents
    onPatch(field.id, { derived: { recipe, parents: trimmed } })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipe, JSON.stringify(parents), requiredCount])

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit “{field.label || 'Click to name'}”</DialogTitle>

      <DialogContent
        dividers
        sx={{
          // tiny layout guard to prevent any short “overlap” while Select mounts
          '& .MuiFormControl-root': { minHeight: 0 },
        }}
      >
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography variant="overline" color="text.secondary">
            Basics
          </Typography>

          <TextField
            label="Label"
            value={field.label}
            onChange={(e) => onPatch(field.id, { label: e.target.value })}
            fullWidth
          />

          {(field.type === 'text' || field.type === 'number' || field.type === 'textarea' || field.type === 'date') && (
            <>
              <Typography variant="overline" color="text.secondary">
                Default
              </Typography>
              <TextField
                label="Default value"
                type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                InputLabelProps={field.type === 'date' ? { shrink: true } : undefined}
                value={field.defaultValue ?? ''}
                onChange={(e) => onPatch(field.id, { defaultValue: e.target.value })}
                fullWidth
              />
            </>
          )}

          <Divider />

          <Typography variant="overline" color="text.secondary">
            Validation
          </Typography>
          <Box>
            <FormControlLabel
              control={
                <Checkbox
                  checked={(field.validations ?? []).includes('required')}
                  onChange={() => toggleValidation('required')}
                />
              }
              label="Required"
            />
            {field.type === 'text' && (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={(field.validations ?? []).includes('email')}
                    onChange={() => toggleValidation('email')}
                  />
                }
                label="Must be a valid email"
              />
            )}
          </Box>

          {/* Length rules (text + textarea) */}
          {(field.type === 'text' || field.type === 'textarea') && (
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <TextField
                size="small"
                type="number"
                label="Min length"
                inputProps={{ min: 0 }}
                value={field.minLength ?? ''}
                onChange={(e) =>
                  onPatch(field.id, {
                    minLength: e.target.value === '' ? undefined : Number(e.target.value),
                  })
                }
                sx={{ maxWidth: 160 }}
              />
              <TextField
                size="small"
                type="number"
                label="Max length"
                inputProps={{ min: 0 }}
                value={field.maxLength ?? ''}
                onChange={(e) =>
                  onPatch(field.id, {
                    maxLength: e.target.value === '' ? undefined : Number(e.target.value),
                  })
                }
                sx={{ maxWidth: 160 }}
              />
            </Stack>
          )}

          {/* Password policy (text only) */}
          {field.type === 'text' && (
            <FormControlLabel
              sx={{ mt: 0.5 }}
              control={
                <Checkbox
                  checked={!!field.password}
                  onChange={(e) => onPatch(field.id, { password: e.target.checked })}
                />
              }
              label="Password policy: min 8 & must include a number"
            />
          )}

          {/* DERIVED (recipes only) */}
          <Divider />
          <Typography variant="overline" color="text.secondary">
            Derived (optional)
          </Typography>

          <FormControl size="small" fullWidth sx={{ maxWidth: 280 }}>
            <InputLabel id="recipe-lbl">Recipe</InputLabel>
            <Select
              labelId="recipe-lbl"
              label="Recipe"
              value={recipe}
              onChange={(e) => {
                setParents([]) // reset parents when recipe changes
                setRecipe(e.target.value as DerivedRecipe | '')
              }}
              MenuProps={{
                keepMounted: true, // prevents remount flicker
                disablePortal: true,
                transitionDuration: 0, // no grow/fade to avoid micro-jank
              }}
            >
              <MenuItem value="">None</MenuItem>
              <MenuItem value="fullName">Full name (A + B)</MenuItem>
              <MenuItem value="ageFromDate">Age from Date</MenuItem>
              <MenuItem value="daysBetweenDates">Days between two Dates</MenuItem>
              <MenuItem value="uppercase">Uppercase of A</MenuItem>
              <MenuItem value="lowercase">Lowercase of A</MenuItem>
            </Select>
            {!!parentsErr && <FormHelperText error>{parentsErr}</FormHelperText>}
          </FormControl>

          {!!recipe && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                Pick parent field{requiredCount > 1 ? 's' : ''}:
              </Typography>

              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.5, // stable vertical spacing
                }}
              >
                {candidates.map((p) => {
                  const checked = parents.includes(p.key)
                  const disableExtra = requiredCount > 0 && !checked && parents.length >= requiredCount
                  return (
                    <FormControlLabel
                      key={p.id}
                      sx={{ m: 0 }}
                      control={
                        <Checkbox
                          checked={checked}
                          onChange={(e) =>
                            setParents((cur) =>
                              e.target.checked ? [...cur, p.key] : cur.filter((k) => k !== p.key)
                            )
                          }
                          disabled={disableExtra}
                        />
                      }
                      // we purposely hide the tech key from the label for non-devs
                      label={p.label || '(unnamed)'}
                    />
                  )
                })}
              </Box>
            </Box>
          )}

          {(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && (
            <>
              <Divider />
              <Typography variant="overline" color="text.secondary">
                Options
              </Typography>
              <Stack spacing={1}>
                {(field.options ?? []).map((opt, i) => (
                  <Stack
                    key={i}
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={1}
                    alignItems={{ xs: 'stretch', sm: 'center' }}
                  >
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
                    <IconButton
                      aria-label="delete"
                      onClick={() => removeOption(i)}
                      sx={{ alignSelf: { xs: 'flex-end', sm: 'center' } }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                ))}
                <Button onClick={addOption} variant="outlined" size="small">
                  Add option
                </Button>
              </Stack>
            </>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}
