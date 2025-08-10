# Dynamic Form Builder (React + TypeScript + Redux + MUI)

A clean, modern form‑builder you can run locally or deploy in minutes. Build fields, apply validations, create *derived* fields with friendly recipes, preview the form, and save schemas — all with a crisp MUI v6 UI.

**Live demo:** [https://form-builder-for-uplianceai.netlify.app/create](https://form-builder-for-uplianceai.netlify.app/create)

---

## Table of contents

* [Features](#features)
* [Tech stack](#tech-stack)
* [Project structure](#project-structure)
* [Getting started](#getting-started)
* [Usage guide](#usage-guide)
* [Derived fields (recipes)](#derived-fields-recipes)
* [Validation rules](#validation-rules)
* [Persistence & saved forms](#persistence--saved-forms)
* [Deployment](#deployment)
* [Troubleshooting](#troubleshooting)
* [Roadmap](#roadmap)

---

## Features

* **Drag‑free but fast**: one‑click add for **Text, Number, Textarea, Select, Radio, Checkbox, Date**.
* **Inline schema editing**: label, key (auto‑slug suggestion), defaults, options, required toggle.
* **Validations**: required, min/max length, email, optional password policy.
* **Derived fields (no formulas typing)**: choose from friendly **recipes** and pick parent fields — *no keys or syntax required*.

  * Full name (A + B)
  * Age from Date
  * Days between two Dates
  * Uppercase of A / Lowercase of A
* **Reorder & delete** with one click.
* **Preview** with runtime validations; derived fields are **read‑only** in preview.
* **Save forms (schema only)** to localStorage; open later from **My Forms**.
* **SPA‑ready**: Netlify/Vercel configs included.

---

## Tech stack

* **Vite + React 18 + TypeScript**
* **Redux Toolkit** for predictable state & persistence middleware
* **MUI v6** for UI components
* **uuid** for stable field ids

---

## Project structure

```
form-builder/
├── src/                     # Source code directory
│   ├── app/                # Application core
│   │   └── store.ts        # Redux store configuration
│   │
│   ├── features/           # Feature modules
│   │   ├── components/     # Shared components
│   │   │   └── FieldEditDialog.tsx  # Form field editor dialog
│   │   │
│   │   └── formBuilder/    # Form builder feature
│   │       ├── formSlice.ts      # Redux state management
│   │       └── localStorage.ts    # Local storage persistence
│   │
│   ├── routes/             # Route components
│   │   ├── CreateFormPage.tsx    # Form creation page
│   │   ├── MyFormsPage.tsx       # Saved forms listing
│   │   └── PreviewPage.tsx       # Form preview page
│   │
│   ├── App.css             # App-specific styles
│   ├── App.tsx             # Main App component
│   ├── index.css           # Global styles
│   ├── main.tsx            # Application entry point
│   ├── styles.css          # Additional styles
│   └── vite-env.d.ts       # Vite type declarations
│
├── public/                  # Static assets
│   ├── _redirects          # Netlify redirects config
│   └── vite.svg            # Default Vite icon
│
├── eslint.config.js        # ESLint configuration
├── index.html              # HTML entry point
├── netlify.toml            # Netlify deployment config
├── package.json            # Project dependencies and scripts
├── README.md               # Project documentation
├── tsconfig.app.json       # TypeScript config for app
├── tsconfig.json           # Base TypeScript config
├── tsconfig.node.json      # TypeScript config for Node
└── vite.config.ts          # Vite build configuration
```

---

## Getting started

```bash
# 1) Install
npm i

# 2) Run locally
npm run dev

# 3) Build & preview production
npm run build
npm run preview
```

Requirements: **Node 18+ (recommended 20)**.

---

## Usage guide

### 1) Create

* Use **Add fields** to insert a field type.
* Click a field to edit **Label**, **Key**, **Default**, **Options** (for select/radio/checkbox) and **Validations**.
* Use arrows to **reorder**; trash to **delete**.

### 2) Derived fields (recipes)

* In the editor dialog, open **Derived** → choose a **Recipe**.
* Pick the required **parent field(s)**. UI enforces valid counts and compatible types.
* Derived fields are computed automatically and shown read‑only in Preview.

### 3) Save & reopen

* Click **Save** (dialog asks for a form name). Only the **schema** is stored.
* Open any saved schema from **My Forms**.

### 4) Preview & submit

* Preview renders the form with validations.
* Submit triggers validation and (demo) shows a JSON payload.

---

## Derived fields (recipes)

**Why recipes?** They hide dev‑only concepts like keys or formulas, making it usable for non‑developers.

Available recipes:

* **Full name (A + B)** → `text` + `text/textarea`
* **Age from Date** → `date`
* **Days between two Dates** → `date` + `date`
* **Uppercase/Lowercase of A** → `text/textarea`

Rules:

* You cannot select the field itself as a parent.
* Parent type compatibility is enforced.
* Cycles are prevented.

---

## Validation rules

* **Required** (not empty)
* **Min/Max length** (text, textarea)
* **Email** format
* **Password policy** (text): min length, require a number

Errors are shown inline (MUI helperText / error state).

---

## Persistence & saved forms

* Local persistence via a small Redux middleware.
* We only persist *schemas* (no user submission data).
* Saved list appears in **My Forms** with name + created date.

---

## Deployment

### Netlify

* `netlify.toml` and `public/_redirects` are included for SPA routing.
* Build command: `npm run build`  →  Publish directory: `dist`.
* Ensure Node **20** in the build image (Netlify will read `.nvmrc` if present, or set via UI).

### Vercel

* Framework preset: **Vite**
* Build command: `npm run build`
* Output: `dist`

---

## Troubleshooting

* **Rollup native optional deps error** (`@rollup/rollup-linux-x64-gnu`):

  * Clear cache and reinstall: `rm -rf node_modules && npm ci`.
  * Make sure Node is **18+** (prefer **20**) on CI.
* **MUI Grid2 import error**: `import Grid from '@mui/material/Grid2'` and use `<Grid size={{ xs: 12, md: 6 }} />`. Ensure `@mui/material@^6`.
* **SPA 404 on refresh**: confirm `public/_redirects` (or `netlify.toml`) exists.
* **TypeScript unused import errors** on CI: remove unused imports or enable `noEmit` build via Vite only (`vite build`).

---

> © 2025 — Dynamic Form Builder. MIT Licensed.
