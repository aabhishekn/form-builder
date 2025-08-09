import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { v4 as uuid } from 'uuid'

type Field = { id: string; label: string; key: string; type: 'text' }
type FormState = { fields: Field[] }

const initialState: FormState = { fields: [] }

const slice = createSlice({
  name: 'form',
  initialState,
  reducers: {
    addTextField(state) {
      const id = uuid()
      state.fields.push({
        id,
        label: 'Untitled',
        key: `field_${id.slice(0, 8)}`,
        type: 'text',
        validations: [],
      })
    },
    updateField(state, action: PayloadAction<{ id: string; patch: Partial<Field> }>) {
      const f = state.fields.find((x) => x.id === action.payload.id)
      if (f) Object.assign(f, action.payload.patch)
    },
  },
})

export const { addTextField, updateField } = slice.actions
export default slice.reducer
