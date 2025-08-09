// src/features/formBuilder/localStorage.ts
import type { Middleware } from '@reduxjs/toolkit'

const SAVED_KEY = 'fb_saved_forms'
const CURRENT_KEY = 'fb_current_builder'

function safeParse<T>(s: string | null): T | null {
  try { return s ? (JSON.parse(s) as T) : null } catch { return null }
}

export function loadSaved(): any[] {
  if (typeof window === 'undefined') return []
  return safeParse<any[]>(localStorage.getItem(SAVED_KEY)) ?? []
}

export function loadCurrent(): { fields: any[]; formName: string } | null {
  if (typeof window === 'undefined') return null
  return safeParse<{ fields: any[]; formName: string }>(localStorage.getItem(CURRENT_KEY))
}

export function saveAll(forms: any[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(SAVED_KEY, JSON.stringify(forms))
}

export function saveCurrent(curr: { fields: any[]; formName: string }) {
  if (typeof window === 'undefined') return
  localStorage.setItem(CURRENT_KEY, JSON.stringify(curr))
}

// Redux middleware: after every action, persist both
export const persistMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action)
  const state: any = store.getState()
  const form = state.form
  saveAll(form.saved)
  saveCurrent({ fields: form.fields, formName: form.formName })
  return result
}
