import * as React from "react";
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
  FormGroup,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import type { Field, DerivedRecipe } from "../formBuilder/formSlice";

export default function FieldEditDialog({
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

  // ---------- logic (unchanged) ----------
  const toggleValidation = (rule: "required" | "email") => {
    const set = new Set<string>(field.validations ?? []);
    set.has(rule) ? set.delete(rule) : set.add(rule);
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
    if (recipe === "ageFromDate" || recipe === "daysBetweenDates")
      return t === "date";
    if (
      recipe === "uppercase" ||
      recipe === "lowercase" ||
      recipe === "fullName"
    )
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

  React.useEffect(() => {
    if (!recipe) {
      onPatch(field.id, { derived: undefined });
      return;
    }
    const trimmed =
      requiredCount > 0 ? parents.slice(0, requiredCount) : parents;
    onPatch(field.id, { derived: { recipe, parents: trimmed } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipe, JSON.stringify(parents), requiredCount]);

  // Keep menus inside dialog to prevent overlay/jank while scrolling
  const contentRef = React.useRef<HTMLDivElement | null>(null);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      keepMounted
      TransitionProps={{ timeout: 0 }}
      slotProps={{ backdrop: { transitionDuration: 0 } }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        Edit “{field.label || "Click to name"}”
      </DialogTitle>

      <DialogContent
        ref={contentRef}
        dividers
        sx={{
          "& .mui-section": {
            p: 2,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          },
        }}
      >
        <Stack spacing={2}>
          {/* Basics */}
          <Paper className="mui-section" variant="outlined">
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Basics
            </Typography>
            <Stack spacing={1.25}>
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
              )}
            </Stack>
          </Paper>

          {/* Validation */}
          <Paper className="mui-section" variant="outlined">
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Validation
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <FormControlLabel
                sx={{ m: 0 }}
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
                  sx={{ m: 0 }}
                  control={
                    <Checkbox
                      checked={(field.validations ?? []).includes("email")}
                      onChange={() => toggleValidation("email")}
                    />
                  }
                  label="Must be a valid email"
                />
              )}
            </Stack>
          </Paper>

          {/* Length / Password */}
          {(field.type === "text" || field.type === "textarea") && (
            <Paper className="mui-section" variant="outlined">
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Length
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
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
                  sx={{ maxWidth: 180 }}
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
                  sx={{ maxWidth: 180 }}
                />
              </Stack>
            </Paper>
          )}

          {field.type === "text" && (
            <Paper className="mui-section" variant="outlined">
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Password policy
              </Typography>
              <FormControlLabel
                sx={{ m: 0 }}
                control={
                  <Checkbox
                    checked={!!field.password}
                    onChange={(e) =>
                      onPatch(field.id, { password: e.target.checked })
                    }
                  />
                }
                label="Min 8 & must include a number"
              />
            </Paper>
          )}

          {/* Derived */}
          <Paper className="mui-section" variant="outlined">
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Derived (optional)
            </Typography>

            <FormControl size="small" fullWidth>
              <InputLabel id="recipe-lbl" shrink>
                Recipe
              </InputLabel>
              <Select
                labelId="recipe-lbl"
                label="Recipe"
                value={recipe}
                onChange={(e) => {
                  setParents([]); // reset parents on change
                  setRecipe(e.target.value as DerivedRecipe | "");
                }}
                MenuProps={{
                  keepMounted: true,
                  disablePortal: true,
                  disableScrollLock: true,
                  transitionDuration: 0,
                  container: () => contentRef.current as any,
                }}
              >
                <MenuItem value="">None</MenuItem>
                <MenuItem value="fullName">Full name (A + B)</MenuItem>
                <MenuItem value="ageFromDate">Age from Date</MenuItem>
                <MenuItem value="daysBetweenDates">
                  Days between two Dates
                </MenuItem>
                <MenuItem value="uppercase">Uppercase of A</MenuItem>
                <MenuItem value="lowercase">Lowercase of A</MenuItem>
              </Select>
              {!!parentsErr && (
                <FormHelperText error>{parentsErr}</FormHelperText>
              )}
            </FormControl>

            {!!recipe && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  Pick parent field{requiredCount > 1 ? "s" : ""}:
                </Typography>

                {/* Rebuilt as a stable List to avoid overlap while fast scrolling */}
                <Paper
                  variant="outlined"
                  sx={{
                    maxHeight: 260,
                    overflowY: "auto",
                    borderRadius: 1.5,
                    borderColor: "divider",
                    bgcolor: "background.default",
                    // Prevent scroll-anchoring jumps
                    overflowAnchor: "none",
                  }}
                >
                  <List dense disablePadding>
                    {candidates.map((p) => {
                      const checked = parents.includes(p.key);
                      const disableExtra =
                        requiredCount > 0 &&
                        !checked &&
                        parents.length >= requiredCount;
                      return (
                        <ListItem
                          key={p.id}
                          disableGutters
                          sx={{
                            py: 0.5,
                            px: 1,
                            alignItems: "flex-start",
                          }}
                          secondaryAction={null}
                        >
                          <ListItemIcon sx={{ minWidth: 36, mt: 0.25 }}>
                            <Checkbox
                              edge="start"
                              size="small"
                              checked={checked}
                              onChange={(e) =>
                                setParents((cur) =>
                                  e.target.checked
                                    ? [...cur, p.key]
                                    : cur.filter((k) => k !== p.key)
                                )
                              }
                              disabled={disableExtra}
                              tabIndex={-1}
                              disableRipple
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary={p.label || "(unnamed)"}
                            primaryTypographyProps={{
                              variant: "body2",
                              sx: { whiteSpace: "normal" },
                            }}
                          />
                        </ListItem>
                      );
                    })}
                  </List>
                </Paper>
              </Box>
            )}
          </Paper>

          {/* Options */}
          {(field.type === "select" ||
            field.type === "radio" ||
            field.type === "checkbox") && (
            <Paper className="mui-section" variant="outlined">
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
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
                      onChange={(e) =>
                        updateOption(i, { label: e.target.value })
                      }
                      fullWidth
                    />
                    <TextField
                      size="small"
                      label="Value"
                      value={opt.value}
                      onChange={(e) =>
                        updateOption(i, { value: e.target.value })
                      }
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
            </Paper>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 2, py: 1 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onClose} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
