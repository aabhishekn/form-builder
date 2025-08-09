import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { v4 as uuid } from 'uuid'

type FieldType = 'text' | 'select'
type Option = { label: string; value: string }
type Validation = 'required' | 'email'

type Field = {
  id: string
  label: string
  key: string
  type: FieldType
  validations: Validation[]
  options?: Option[] // only for select
}

type FormState = { fields: Field[] }
const initialState: FormState = { fields: [] }

const slice = createSlice({
  name: 'form',
  initialState,
  reducers: {
    addField(state, action: PayloadAction<FieldType>) {
      const id = uuid()
      const base: Field = {
        id,
        label: 'Untitled',
        key: `field_${id.slice(0, 8)}`,
        type: action.payload,
        validations: [],
      }
      if (action.payload === 'select') {
        base.options = [
          { label: 'Option 1', value: 'opt1' },
          { label: 'Option 2', value: 'opt2' },
        ]
      }
      state.fields.push(base)
    },

    updateField(state, action: PayloadAction<{ id: string; patch: Partial<Field> }>) {
      const f = state.fields.find((x) => x.id === action.payload.id)
      if (f) Object.assign(f, action.payload.patch)
    },
  },
})

export const { addField, updateField } = slice.actions
export default slice.reducer
