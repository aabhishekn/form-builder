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

const emailRegex =
  /^(?:[a-zA-Z0-9_'^&\-]+(?:\.[a-zA-Z0-9_'^&\-]+)*|".+")@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;

function computeAge(dobISO: string): number {
  if (!dobISO) return 0;
  const dob = new Date(dobISO);
  if (Number.isNaN(dob.getTime())) return 0;
  const diff = Date.now() - dob.getTime();
  const ageDt = new Date(diff);
  return Math.abs(ageDt.getUTCFullYear() - 1970);
}

function daysBetween(aISO: string, bISO: string): number {
  if (!aISO || !bISO) return 0;
  const a = new Date(aISO);
  const b = new Date(bISO);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return 0;
  const ms = Math.abs(b.getTime() - a.getTime());
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function computeDerived(
  fields: RootState["form"]["fields"],
  base: Record<string, any>
) {
  const next = { ...base };
  for (const f of fields) {
    if (!f.derived) continue;
    const { recipe, parents } = f.derived;
    const get = (k: string) => next[k];

    try {
      switch (recipe) {
        case "fullName": {
          const [a, b] = parents;
          next[f.key] = [get(a) ?? "", get(b) ?? ""].join(" ").trim();
          break;
        }
        case "ageFromDate": {
          const [a] = parents;
          next[f.key] = computeAge(String(get(a) ?? ""));
          break;
        }
        case "daysBetweenDates": {
          const [a, b] = parents;
          next[f.key] = daysBetween(String(get(a) ?? ""), String(get(b) ?? ""));
          break;
        }
        case "uppercase": {
          const [a] = parents;
          next[f.key] = String(get(a) ?? "").toUpperCase();
          break;
        }
        case "lowercase": {
          const [a] = parents;
          next[f.key] = String(get(a) ?? "").toLowerCase();
          break;
        }
      }
    } catch {
      // ignore bad inputs
    }
  }
  return next;
}

export default function PreviewPage() {
  const fields = useSelector((s: RootState) => s.form.fields);
  const [values, setValues] = React.useState<Record<string, any>>({});
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Initialize from schema (defaultValue; arrays for checkbox), then compute derived once.
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

      // min length (text/textarea only)
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

      // max length (text/textarea only)
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

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    // recompute derived before validating, in case parents changed
    setValues((prev) => {
      const computed = computeDerived(fields, prev);
      const ok = validate();
      if (ok) {
        alert("Submitted:\n" + JSON.stringify(computed, null, 2));
      }
      return computed;
    });
  };

  const set = (k: string, val: any) =>
    setValues((prev) => computeDerived(fields, { ...prev, [k]: val }));

  return (
    <form onSubmit={submit}>
      <Stack spacing={2}>
        {fields.map((f) => {
          const err = errors[f.key];
          const isDerived = !!f.derived;
          const common = {
            label: f.label || "Untitled",
            error: !!err,
            helperText: err ?? " ",
            fullWidth: true,
            InputProps: isDerived ? { readOnly: true } : undefined,
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
