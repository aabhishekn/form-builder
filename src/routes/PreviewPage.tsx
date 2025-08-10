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
import { Parser } from "expr-eval";

const emailRegex =
  /^(?:[a-zA-Z0-9_'^&\-]+(?:\.[a-zA-Z0-9_'^&\-]+)*|".+")@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;

// --- small expression runtime for derived fields ---
const parser = new Parser({ allowMemberAccess: false });

const helpers = {
  now: () => Date.now(),
  concat: (...args: any[]) => args.join(""),
  lower: (s: any) => String(s ?? "").toLowerCase(),
  upper: (s: any) => String(s ?? "").toUpperCase(),
  ageFrom: (dobISO: string) => {
    if (!dobISO) return 0;
    const d = new Date(dobISO);
    const diff = Date.now() - d.getTime();
    const ageDt = new Date(diff);
    return Math.abs(ageDt.getUTCFullYear() - 1970);
  },
  dateDiffDays: (aISO: string, bISO: string) => {
    if (!aISO || !bISO) return 0;
    const a = new Date(aISO);
    const b = new Date(bISO);
    const ms = Math.abs(b.getTime() - a.getTime());
    return Math.floor(ms / (1000 * 60 * 60 * 24));
  },
};

function computeDerived(fields: any[], values: Record<string, any>) {
  const next = { ...values };
  for (const f of fields) {
    if (f.derived?.isDerived && f.derived.formula) {
      const scope: Record<string, any> = { ...helpers };
      for (const k of f.derived.dependsOn ?? []) scope[k] = next[k];
      try {
        const expr = parser.parse(f.derived.formula);
        next[f.key] = expr.evaluate(scope);
      } catch {
        // ignore invalid formulas
      }
    }
  }
  return next;
}

export default function PreviewPage() {
  const fields = useSelector((s: RootState) => s.form.fields);
  const [values, setValues] = React.useState<Record<string, any>>({});
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Initialize from schema (use defaultValue; arrays for checkbox) + compute derived
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

  // Recompute derived whenever derived configs change
  React.useEffect(() => {
    setValues((v) => computeDerived(fields, v));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(fields.map((f) => f.derived))]);

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
    if (!validate()) return;
    alert("Submitted:\n" + JSON.stringify(values, null, 2));
  };

  // When user types, recompute derived on-the-fly
  const set = (k: string, val: any) =>
    setValues((prev) => computeDerived(fields, { ...prev, [k]: val }));

  return (
    <form onSubmit={submit}>
      <Stack spacing={2}>
        {fields.map((f) => {
          const err = errors[f.key];
          const isDerived = !!f.derived?.isDerived;
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
                      control={<Radio disabled={isDerived} />}
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
                          disabled={isDerived}
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
