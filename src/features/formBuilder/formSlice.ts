import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { v4 as uuid } from "uuid";
import {
  loadSaved as loadSavedStorage,
  loadCurrent as loadCurrentStorage,
} from "./localStorage";

/** ====== NEW: derived recipes ====== */
type DerivedRecipe = "fullName" | "ageFromDOB" | "daysBetween";
type DerivedConfig = {
  recipe: DerivedRecipe;
  /** parent field keys (not labels) */
  parents: string[]; // fullName: [first,last], ageFromDOB: [dob], daysBetween: [start,end]
};

type FieldType =
  | "text"
  | "number"
  | "textarea"
  | "select"
  | "radio"
  | "checkbox"
  | "date";
type Option = { label: string; value: string };
type Validation = "required" | "email";

export type Field = {
  id: string;
  label: string;
  key: string;
  type: FieldType;
  validations: Validation[];
  defaultValue?: any;
  options?: Option[]; // for select, radio, checkbox
  minLength?: number;
  maxLength?: number;
  password?: boolean;
  /** NEW: if present, field is derived by a recipe */
  derived?: DerivedConfig;
};

type FormSnapshot = {
  id: string;
  name: string;
  createdAt: string;
  fields: Field[];
};

type FormState = {
  fields: Field[];
  formName: string;
  saved: FormSnapshot[];
};

const initialState: FormState = (() => {
  const saved = loadSavedStorage();
  const curr = loadCurrentStorage();
  return {
    fields: curr?.fields ?? [],
    formName: curr?.formName ?? "",
    saved: Array.isArray(saved) ? saved : [],
  };
})();

const slice = createSlice({
  name: "form",
  initialState,
  reducers: {
    addField(state, action: PayloadAction<FieldType>) {
      const id = uuid();
      const type = action.payload;
      const base: Field = {
        id,
        label: "",
        key: `field_${id.slice(0, 8)}`,
        type,
        validations: [],
        defaultValue: type === "checkbox" ? [] : "",
      };

      if (type === "select" || type === "radio" || type === "checkbox") {
        base.options = [
          { label: "Option 1", value: "opt1" },
          { label: "Option 2", value: "opt2" },
        ];
      }

      state.fields.push(base);
    },

    updateField(
      state,
      action: PayloadAction<{ id: string; patch: Partial<Field> }>
    ) {
      const f = state.fields.find((x) => x.id === action.payload.id);
      if (f) Object.assign(f, action.payload.patch);
    },

    setFormName(state, action: PayloadAction<string>) {
      state.formName = action.payload || "";
    },

    saveCurrent(state) {
      const snap: FormSnapshot = {
        id: uuid(),
        name: (state.formName ?? "").trim() || "Untitled",
        createdAt: new Date().toISOString(),
        fields: JSON.parse(JSON.stringify(state.fields)),
      };
      state.saved.unshift(snap);
    },

    loadSaved(state, action: PayloadAction<string>) {
      const found = state.saved.find((s) => s.id === action.payload);
      if (found) {
        state.fields = JSON.parse(JSON.stringify(found.fields));
        state.formName = found.name;
      }
    },

    deleteSaved(state, action: PayloadAction<string>) {
      state.saved = state.saved.filter((s) => s.id !== action.payload);
    },

    deleteField(state, action: PayloadAction<string>) {
      const removed = state.fields.find((f) => f.id === action.payload);
      state.fields = state.fields.filter((f) => f.id !== action.payload);

      // NEW: strip this field’s key from any derived parents
      if (removed) {
        const removedKey = removed.key;
        state.fields = state.fields.map((f) =>
          f.derived
            ? {
                ...f,
                derived: {
                  ...f.derived,
                  parents: f.derived.parents.filter((k) => k !== removedKey),
                },
              }
            : f
        );
      }
    },

    reorderField(
      state,
      action: PayloadAction<{ id: string; direction: "up" | "down" }>
    ) {
      const { id, direction } = action.payload;
      const i = state.fields.findIndex((f) => f.id === id);
      if (i < 0) return;
      const j = direction === "up" ? i - 1 : i + 1;
      if (j < 0 || j >= state.fields.length) return;
      const arr = state.fields;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    },
  },
});

export const {
  addField,
  updateField,
  setFormName,
  saveCurrent,
  loadSaved,
  deleteSaved,
  deleteField,
  reorderField,
} = slice.actions;
export default slice.reducer;
