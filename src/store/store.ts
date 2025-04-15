import { configureStore } from '@reduxjs/toolkit';
import lenderReducer from './lenderSlice';

export const store = configureStore({
  reducer: {
    lenders: lenderReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;