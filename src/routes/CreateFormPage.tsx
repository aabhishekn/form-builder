// src/routes/CreateFormPage.tsx
import * as React from "react";
import {
  Button, List, ListItemButton, ListItemText, Stack, Box, TextField, Typography,
  FormControlLabel, Checkbox, IconButton, Divider, Card, CardHeader, CardContent,
  Alert, Chip, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import EditIcon from "@mui/icons-material/Edit";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../app/store";
import {
  addField, updateField, setFormName, saveCurrent, deleteField, reorderField, type Field
} from "../features/formBuilder/formSlice";

// NEW: import extracted dialog
import FieldEditDialog from "../features/components/FieldEditDialog";

export default function CreateFormPage() {
  const dispatch = useDispatch<AppDispatch>();
  const fields = useSelector((s: RootState) => s.form.fields);
  const formName = useSelector((s: RootState) => s.form.formName);

  const [selectedId, setSelectedId] = React.useState<string | null>(fields[0]?.id ?? null);
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
            {fields.length === 0 && <Alert severity="info">Add fields to get started.</Alert>}

            <List dense sx={{ m: 0 }}>
              {fields.map((f, idx) => (
                <Box
                  key={f.id}
                  sx={{
                    border: "1px solid",
                    borderColor: selectedId === f.id ? "primary.main" : "divider",
                    borderRadius: 2,
                    px: 1,
                    py: 0.5,
                    mb: 1,
                    bgcolor: selectedId === f.id ? "action.hover" : "background.paper",
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
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography
                              fontWeight={600}
                              noWrap
                              color={f.label ? "text.primary" : "text.secondary"}
                              fontStyle={f.label ? "normal" : "italic"}
                            >
                              {f.label || "Click Edit to name"}
                            </Typography>

                            <Chip size="small" label={f.type} variant="outlined" />
                            {f.derived && <Chip size="small" color="secondary" label="derived" />}
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
                          onClick={() => dispatch(reorderField({ id: f.id, direction: "up" }))}
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
                          onClick={() => dispatch(reorderField({ id: f.id, direction: "down" }))}
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
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ xs: "stretch", sm: "center" }}>
                <TextField
                  size="small"
                  label="Form name"
                  value={formName ?? ""}
                  onChange={(e) => {
                    const v = e.target.value
                    if (!openSave) setNameDraft(v)
                    dispatch(setFormName(v))
                  }}
                  sx={{ flex: 1, minWidth: 220 }}
                />
                <Button
                  variant="contained"
                  onClick={() => {
                    setNameDraft(formName || "")
                    setOpenSave(true)
                  }}
                >
                  Save
                </Button>
              </Stack>
            </CardContent>
          </Card>

          {/* Field palette */}
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardHeader title="Add fields" subheader="Pick a type to insert" sx={{ py: 1.5 }} />
            <CardContent>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(120px,1fr))",
                  gap: 1,
                }}
              >
                <Button variant="outlined" onClick={() => dispatch(addField("text"))}>Text</Button>
                <Button variant="outlined" onClick={() => dispatch(addField("number"))}>Number</Button>
                <Button variant="outlined" onClick={() => dispatch(addField("textarea"))}>Textarea</Button>
                <Button variant="outlined" onClick={() => dispatch(addField("select"))}>Dropdown</Button>
                <Button variant="outlined" onClick={() => dispatch(addField("radio"))}>Radio</Button>
                <Button variant="outlined" onClick={() => dispatch(addField("checkbox"))}>Checkbox</Button>
                <Button variant="outlined" onClick={() => dispatch(addField("date"))}>Date</Button>
              </Box>
            </CardContent>
          </Card>
        </Stack>
      </Grid>

      {/* Editor Dialog (extracted) */}
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
          <Button onClick={doSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}
