import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { v4 as uuid } from "uuid";
import {
  loadSaved as loadSavedStorage,
  loadCurrent as loadCurrentStorage,
} from "./localStorage";

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

/** Recipes (no free-text formula) */
export type DerivedRecipe =
  | "fullName"          // needs 2 text/textarea parents
  | "ageFromDate"       // needs 1 date
  | "daysBetweenDates"  // needs 2 dates
  | "uppercase"         // needs 1 text/textarea
  | "lowercase";        // needs 1 text/textarea

export type Derived = {
  recipe: DerivedRecipe;
  parents: string[]; // parent field keys
};

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
  derived?: Derived;   // <-- NEW
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
        defaultValue: type === "checkbox" ? [] : "", // arrays for multi-select
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
        fields: JSON.parse(JSON.stringify(state.fields)), // deep copy
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
      const id = action.payload;
      const removed = state.fields.find((f) => f.id === id);
      state.fields = state.fields.filter((f) => f.id !== id);

      // If any derived fields referenced the removed key, drop that parent.
      if (removed) {
        state.fields = state.fields.map((f) => {
          if (f.derived) {
            const parents = f.derived.parents.filter((k) => k !== removed.key);
            return { ...f, derived: { ...f.derived, parents } };
          }
          return f;
        });
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
