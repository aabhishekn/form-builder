import { configureStore } from '@reduxjs/toolkit'
import formReducer from '../features/formBuilder/formSlice'
import { persistMiddleware } from '../features/formBuilder/localStorage'

export const store = configureStore({
  reducer: { form: formReducer },
  middleware: (getDefault) => getDefault().concat(persistMiddleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
