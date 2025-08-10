// src/routes/CreateFormPage.tsx
import * as React from "react";
import {
  Button,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Box,
  TextField,
  Typography,
  FormControlLabel,
  Checkbox,
  IconButton,
  Divider,
  Card,
  CardHeader,
  CardContent,
  Alert,
  Chip,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  FormHelperText,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import EditIcon from "@mui/icons-material/Edit";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../app/store";
import {
  addField,
  updateField,
  setFormName,
  saveCurrent,
  deleteField,
  reorderField,
  type Field,
  type DerivedRecipe,
} from "../features/formBuilder/formSlice";

export default function CreateFormPage() {
  const dispatch = useDispatch<AppDispatch>();
  const fields = useSelector((s: RootState) => s.form.fields);
  const formName = useSelector((s: RootState) => s.form.formName);

  const [selectedId, setSelectedId] = React.useState<string | null>(
    fields[0]?.id ?? null
  );
  const [editId, setEditId] = React.useState<string | null>(null);

  // Save dialog
  const [openSave, setOpenSave] = React.useState(false);
  const [nameDraft, setNameDraft] = React.useState(formName || "");

  React.useEffect(() => {
    if (fields.length && !selectedId) setSelectedId(fields[0].id);
  }, [fields, selectedId]);

  const editing = fields.find((f) => f.id === editId) || null;

  const doSave = () => {
    const finalName = (nameDraft || "").trim() || "Untitled";
    dispatch(setFormName(finalName));
    dispatch(saveCurrent());
    setOpenSave(false);
  };

  return (
    <Grid container spacing={2}>
      {/* LEFT: Fields list */}
      <Grid size={{ xs: 12, md: 7 }}>
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardHeader
            title={
              <Stack direction="row" alignItems="center" spacing={1}>
                <span>Fields</span>
                <Chip size="small" label={fields.length} />
              </Stack>
            }
            subheader="Click to select • Edit opens a popup • Use arrows to reorder"
            sx={{ py: 1.5 }}
          />
          <CardContent sx={{ pt: 0 }}>
            {fields.length === 0 && (
              <Alert severity="info">Add fields to get started.</Alert>
            )}

            <List dense sx={{ m: 0 }}>
              {fields.map((f, idx) => (
                <Box
                  key={f.id}
                  sx={{
                    border: "1px solid",
                    borderColor:
                      selectedId === f.id ? "primary.main" : "divider",
                    borderRadius: 2,
                    px: 1,
                    py: 0.5,
                    mb: 1,
                    bgcolor:
                      selectedId === f.id ? "action.hover" : "background.paper",
                    transition: "background-color .2s, border-color .2s",
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <ListItemButton
                      selected={selectedId === f.id}
                      onClick={() => setSelectedId(f.id)}
                      sx={{ flex: 1, borderRadius: 2 }}
                    >
                      <ListItemText
                        primary={
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <Typography
                              fontWeight={600}
                              noWrap
                              color={
                                f.label ? "text.primary" : "text.secondary"
                              }
                              fontStyle={f.label ? "normal" : "italic"}
                            >
                              {f.label || "Click Edit to name"}
                            </Typography>

                            <Chip size="small" label={f.type} variant="outlined" />
                            {f.derived && (
                              <Chip size="small" color="secondary" label="derived" />
                            )}
                          </Stack>
                        }
                      />
                    </ListItemButton>

                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => setEditId(f.id)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Move up">
                      <span>
                        <IconButton
                          size="small"
                          onClick={() =>
                            dispatch(
                              reorderField({ id: f.id, direction: "up" })
                            )
                          }
                          disabled={idx === 0}
                        >
                          <ArrowUpwardIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Move down">
                      <span>
                        <IconButton
                          size="small"
                          onClick={() =>
                            dispatch(
                              reorderField({ id: f.id, direction: "down" })
                            )
                          }
                          disabled={idx === fields.length - 1}
                        >
                          <ArrowDownwardIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => dispatch(deleteField(f.id))}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Box>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>

      {/* RIGHT: Form + Palette stacked, sticky */}
      <Grid size={{ xs: 12, md: 5 }}>
        <Stack spacing={2} sx={{ position: { md: "sticky" }, top: { md: 16 } }}>
          {/* Form meta */}
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardHeader title="Form" sx={{ py: 1.5 }} />
            <CardContent>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.5}
                alignItems={{ xs: "stretch", sm: "center" }}
              >
                <TextField
                  size="small"
                  label="Form name"
                  value={formName ?? ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    // keep local draft in sync if dialog isn't open
                    if (!openSave) setNameDraft(v);
                    dispatch(setFormName(v));
                  }}
                  sx={{ flex: 1, minWidth: 220 }}
                />
                <Button
                  variant="contained"
                  onClick={() => {
                    setNameDraft(formName || "");
                    setOpenSave(true);
                  }}
                >
                  Save
                </Button>
              </Stack>
            </CardContent>
          </Card>

          {/* Field palette */}
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardHeader
              title="Add fields"
              subheader="Pick a type to insert"
              sx={{ py: 1.5 }}
            />
            <CardContent>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(120px,1fr))",
                  gap: 1,
                }}
              >
                <Button variant="outlined" onClick={() => dispatch(addField("text"))}>
                  Text
                </Button>
                <Button variant="outlined" onClick={() => dispatch(addField("number"))}>
                  Number
                </Button>
                <Button variant="outlined" onClick={() => dispatch(addField("textarea"))}>
                  Textarea
                </Button>
                <Button variant="outlined" onClick={() => dispatch(addField("select"))}>
                  Dropdown
                </Button>
                <Button variant="outlined" onClick={() => dispatch(addField("radio"))}>
                  Radio
                </Button>
                <Button variant="outlined" onClick={() => dispatch(addField("checkbox"))}>
                  Checkbox
                </Button>
                <Button variant="outlined" onClick={() => dispatch(addField("date"))}>
                  Date
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Stack>
      </Grid>

      {/* Editor Dialog */}
      <FieldEditDialog
        open={!!editId}
        field={editing}
        allFields={fields}
        onClose={() => setEditId(null)}
        onPatch={(id, patch) => dispatch(updateField({ id, patch }))}
      />

      {/* Save dialog */}
      <Dialog open={openSave} onClose={() => setOpenSave(false)}>
        <DialogTitle>Save form</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Form name"
            fullWidth
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSave(false)}>Cancel</Button>
          <Button onClick={doSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}

/* -------- Dialog editor (logic in popup) -------- */

function FieldEditDialog({
  open,
  field,
  allFields,
  onClose,
  onPatch,
}: {
  open: boolean;
  field: Field | null;
  allFields: Field[];
  onClose: () => void;
  onPatch: (id: string, patch: Partial<Field>) => void;
}) {
  if (!field) return null;

  const toggleValidation = (rule: "required" | "email") => {
    const set = new Set<string>(field.validations ?? []);
    if (set.has(rule)) set.delete(rule);
    else set.add(rule);
    onPatch(field.id, { validations: Array.from(set) as any });
  };

  const updateOption = (
    i: number,
    patch: { label?: string; value?: string }
  ) => {
    const next = [...(field.options ?? [])];
    next[i] = { ...next[i], ...patch };
    onPatch(field.id, { options: next });
  };

  const addOption = () => {
    const opts = field.options ?? [];
    onPatch(field.id, {
      options: [
        ...opts,
        { label: `Option ${opts.length + 1}`, value: `opt${opts.length + 1}` },
      ],
    });
  };

  const removeOption = (i: number) => {
    const next = (field.options ?? []).filter((_, idx) => idx !== i);
    onPatch(field.id, { options: next });
  };

  // --- Derived (recipes only) ---
  const [recipe, setRecipe] = React.useState<DerivedRecipe | "">(
    field.derived?.recipe ?? ""
  );
  const [parents, setParents] = React.useState<string[]>(
    field.derived?.parents ?? []
  );

  React.useEffect(() => {
    setRecipe(field.derived?.recipe ?? "");
    setParents(field.derived?.parents ?? []);
  }, [field.id]);

  const requiredCount = React.useMemo(() => {
    if (!recipe) return 0;
    if (recipe === "fullName" || recipe === "daysBetweenDates") return 2;
    return 1;
  }, [recipe]);

  const allowByType = (t: Field["type"]) => {
    if (!recipe) return false;
    if (recipe === "ageFromDate" || recipe === "daysBetweenDates") return t === "date";
    if (recipe === "uppercase" || recipe === "lowercase" || recipe === "fullName")
      return t === "text" || t === "textarea";
    return false;
  };

  const candidates = allFields.filter(
    (f) => f.id !== field.id && allowByType(f.type)
  );

  const parentsErr =
    recipe && parents.length !== requiredCount
      ? `Pick exactly ${requiredCount} field${requiredCount > 1 ? "s" : ""}`
      : "";

  // Commit to store whenever recipe/parents change
  React.useEffect(() => {
    if (!recipe) {
      onPatch(field.id, { derived: undefined });
      return;
    }
    // trim to allowed count
    const trimmed =
      requiredCount > 0 ? parents.slice(0, requiredCount) : parents;
    onPatch(field.id, { derived: { recipe, parents: trimmed } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipe, JSON.stringify(parents), requiredCount]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit “{field.label || "Click to name"}”</DialogTitle>

      <DialogContent dividers>
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

          {(field.type === "text" ||
            field.type === "number" ||
            field.type === "textarea" ||
            field.type === "date") && (
            <>
              <Typography variant="overline" color="text.secondary">
                Default
              </Typography>
              <TextField
                label="Default value"
                type={
                  field.type === "number"
                    ? "number"
                    : field.type === "date"
                    ? "date"
                    : "text"
                }
                InputLabelProps={
                  field.type === "date" ? { shrink: true } : undefined
                }
                value={field.defaultValue ?? ""}
                onChange={(e) =>
                  onPatch(field.id, { defaultValue: e.target.value })
                }
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
                  checked={(field.validations ?? []).includes("required")}
                  onChange={() => toggleValidation("required")}
                />
              }
              label="Required"
            />
            {field.type === "text" && (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={(field.validations ?? []).includes("email")}
                    onChange={() => toggleValidation("email")}
                  />
                }
                label="Must be a valid email"
              />
            )}
          </Box>

          {/* Length rules (text + textarea) */}
          {(field.type === "text" || field.type === "textarea") && (
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              sx={{ mt: 1 }}
            >
              <TextField
                size="small"
                type="number"
                label="Min length"
                inputProps={{ min: 0 }}
                value={field.minLength ?? ""}
                onChange={(e) =>
                  onPatch(field.id, {
                    minLength:
                      e.target.value === ""
                        ? undefined
                        : Number(e.target.value),
                  })
                }
                sx={{ maxWidth: 160 }}
              />
              <TextField
                size="small"
                type="number"
                label="Max length"
                inputProps={{ min: 0 }}
                value={field.maxLength ?? ""}
                onChange={(e) =>
                  onPatch(field.id, {
                    maxLength:
                      e.target.value === ""
                        ? undefined
                        : Number(e.target.value),
                  })
                }
                sx={{ maxWidth: 160 }}
              />
            </Stack>
          )}

          {/* Password policy (text only) */}
          {field.type === "text" && (
            <FormControlLabel
              sx={{ mt: 1 }}
              control={
                <Checkbox
                  checked={!!field.password}
                  onChange={(e) =>
                    onPatch(field.id, { password: e.target.checked })
                  }
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

          <FormControl size="small" sx={{ maxWidth: 260 }}>
            <InputLabel id="recipe-lbl">Recipe</InputLabel>
            <Select
              labelId="recipe-lbl"
              label="Recipe"
              value={recipe}
              onChange={(e) => {
                setParents([]); // reset parents when recipe changes
                setRecipe(e.target.value as DerivedRecipe | "");
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
                Pick parent field{requiredCount > 1 ? "s" : ""}:
              </Typography>
              <Stack>
                {candidates.map((p) => {
                  const checked = parents.includes(p.key);
                  const disableExtra =
                    requiredCount > 0 && !checked && parents.length >= requiredCount;
                  return (
                    <FormControlLabel
                      key={p.id}
                      control={
                        <Checkbox
                          checked={checked}
                          onChange={(e) =>
                            setParents((cur) =>
                              e.target.checked
                                ? [...cur, p.key]
                                : cur.filter((k) => k !== p.key)
                            )
                          }
                          disabled={disableExtra}
                        />
                      }
                      label={`${p.label || "(unnamed)"}`}
                    />
                  );
                })}
              </Stack>
            </Box>
          )}

          {(field.type === "select" ||
            field.type === "radio" ||
            field.type === "checkbox") && (
            <>
              <Divider />
              <Typography variant="overline" color="text.secondary">
                Options
              </Typography>
              <Stack spacing={1}>
                {(field.options ?? []).map((opt: any, i: number) => (
                  <Stack
                    key={i}
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1}
                    alignItems={{ xs: "stretch", sm: "center" }}
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
                      sx={{ alignSelf: { xs: "flex-end", sm: "center" } }}
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
  );
}
