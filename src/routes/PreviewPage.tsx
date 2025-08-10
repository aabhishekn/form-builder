import * as React from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../app/store";
import {
  Alert,
  Button,
  Stack,
  TextField,
  MenuItem,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  FormGroup,
} from "@mui/material";
import type { Field, DerivedRecipe } from "../features/formBuilder/formSlice";

const emailRegex =
  /^(?:[a-zA-Z0-9_'^&\-]+(?:\.[a-zA-Z0-9_'^&\-]+)*|".+")@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;

function computeDerived(fields: Field[], values: Record<string, any>) {
  const next = { ...values };

  const get = (k: string) => next[k];

  const ageFrom = (iso?: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    const diff = Date.now() - d.getTime();
    const ageDt = new Date(diff);
    return Math.abs(ageDt.getUTCFullYear() - 1970);
  };

  const daysBetween = (a?: string, b?: string) => {
    if (!a || !b) return "";
    const A = new Date(a);
    const B = new Date(b);
    if (isNaN(A.getTime()) || isNaN(B.getTime())) return "";
    const ms = Math.abs(B.getTime() - A.getTime());
    return Math.floor(ms / (1000 * 60 * 60 * 24));
  };

  for (const f of fields) {
    const d = f.derived;
    if (!d) continue;

    const parents = d.parents.map((k) => get(k));

    let out: any = "";
    const r: DerivedRecipe = d.recipe;

    if (r === "fullName") {
      out = [parents[0] ?? "", parents[1] ?? ""].filter(Boolean).join(" ").trim();
    } else if (r === "ageFromDate") {
      out = ageFrom(parents[0]);
    } else if (r === "daysBetweenDates") {
      out = daysBetween(parents[0], parents[1]);
    } else if (r === "uppercase") {
      out = (parents[0] ?? "").toString().toUpperCase();
    } else if (r === "lowercase") {
      out = (parents[0] ?? "").toString().toLowerCase();
    }

    next[f.key] = out;
  }
  return next;
}

export default function PreviewPage() {
  const fields = useSelector((s: RootState) => s.form.fields);
  const [values, setValues] = React.useState<Record<string, any>>({});
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Initialize from schema and compute derived once
  React.useEffect(() => {
    const init: Record<string, any> = {};
    fields.forEach((f) => {
      init[f.key] =
        f.defaultValue !== undefined
          ? f.defaultValue
          : f.type === "checkbox"
          ? []
          : "";
    });
    setValues(computeDerived(fields, init));
    setErrors({});
  }, [fields]);

  if (!fields.length)
    return <Alert severity="info">Go to Create and add fields first.</Alert>;

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    for (const f of fields) {
      const v = values[f.key];
      const rules = f.validations ?? [];

      // required
      if (
        rules.includes("required") &&
        (v === "" ||
          v === undefined ||
          v === null ||
          (Array.isArray(v) && v.length === 0))
      ) {
        next[f.key] = "This field is required.";
        continue;
      }

      // email (text only)
      if (
        f.type === "text" &&
        rules.includes("email") &&
        v &&
        !emailRegex.test(String(v))
      ) {
        next[f.key] = "Enter a valid email address.";
        continue;
      }

      // min/max length (if present on your Field)
      if (
        (f.type === "text" || f.type === "textarea") &&
        typeof f.minLength === "number" &&
        f.minLength > 0
      ) {
        const s = String(v ?? "");
        if (s.length > 0 && s.length < f.minLength) {
          next[f.key] = `Minimum length is ${f.minLength}.`;
          continue;
        }
      }
      if (
        (f.type === "text" || f.type === "textarea") &&
        typeof f.maxLength === "number" &&
        f.maxLength > 0
      ) {
        const s = String(v ?? "");
        if (s.length > f.maxLength) {
          next[f.key] = `Maximum length is ${f.maxLength}.`;
          continue;
        }
      }

      // password policy (text only)
      if (f.type === "text" && f.password) {
        const s = String(v ?? "");
        if (s.length > 0 && s.length < 8) {
          next[f.key] = "Password must be at least 8 characters.";
          continue;
        }
        if (s.length > 0 && !/[0-9]/.test(s)) {
          next[f.key] = "Password must include a number.";
          continue;
        }
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const set = (k: string, val: any) =>
    setValues((prev) => computeDerived(fields, { ...prev, [k]: val }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    alert("Submitted:\n" + JSON.stringify(values, null, 2));
  };

  return (
    <form onSubmit={submit}>
      <Stack spacing={2}>
        {fields.map((f) => {
          const err = errors[f.key];
          const common = {
            label: f.label || "Untitled",
            error: !!err,
            helperText: err ?? " ",
            fullWidth: true,
            InputProps: { readOnly: !!f.derived }, // derived are read-only
          } as const;

          if (f.type === "textarea") {
            return (
              <TextField
                key={f.id}
                {...common}
                value={values[f.key] ?? ""}
                onChange={(e) => set(f.key, e.target.value)}
                multiline
                minRows={3}
              />
            );
          }

          if (f.type === "number") {
            return (
              <TextField
                key={f.id}
                {...common}
                type="number"
                value={values[f.key] ?? ""}
                onChange={(e) => set(f.key, e.target.value)}
              />
            );
          }

          if (f.type === "date") {
            return (
              <TextField
                key={f.id}
                {...common}
                type="date"
                value={values[f.key] ?? ""}
                onChange={(e) => set(f.key, e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            );
          }

          if (f.type === "select") {
            return (
              <TextField
                key={f.id}
                {...common}
                select
                value={values[f.key] ?? ""}
                onChange={(e) => set(f.key, e.target.value)}
              >
                {(f.options ?? []).map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </TextField>
            );
          }

          if (f.type === "radio") {
            return (
              <FormControl key={f.id} error={!!err}>
                <FormLabel>{f.label}</FormLabel>
                <RadioGroup
                  value={values[f.key] ?? ""}
                  onChange={(e) => set(f.key, e.target.value)}
                >
                  {(f.options ?? []).map((o) => (
                    <FormControlLabel
                      key={o.value}
                      value={o.value}
                      control={<Radio />}
                      label={o.label}
                    />
                  ))}
                </RadioGroup>
                <span
                  style={{
                    color: "var(--mui-palette-error-main)",
                    fontSize: 12,
                  }}
                >
                  {err ?? " "}
                </span>
              </FormControl>
            );
          }

          if (f.type === "checkbox") {
            const arr: string[] = Array.isArray(values[f.key])
              ? values[f.key]
              : [];
            const toggle = (val: string) => {
              const has = arr.includes(val);
              set(f.key, has ? arr.filter((x) => x !== val) : [...arr, val]);
            };
            return (
              <FormControl key={f.id} error={!!err}>
                <FormLabel>{f.label}</FormLabel>
                <FormGroup>
                  {(f.options ?? []).map((o) => (
                    <FormControlLabel
                      key={o.value}
                      control={
                        <Checkbox
                          checked={arr.includes(o.value)}
                          onChange={() => toggle(o.value)}
                        />
                      }
                      label={o.label}
                    />
                  ))}
                </FormGroup>
                <span
                  style={{
                    color: "var(--mui-palette-error-main)",
                    fontSize: 12,
                  }}
                >
                  {err ?? " "}
                </span>
              </FormControl>
            );
          }

          // default: text
          return (
            <TextField
              key={f.id}
              {...common}
              value={values[f.key] ?? ""}
              onChange={(e) => set(f.key, e.target.value)}
            />
          );
        })}
        <Button type="submit" variant="contained">
          Submit
        </Button>
      </Stack>
    </form>
  );
}
