import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./authSlice";
import seasonReducer from "./seasonSlice";

export const store = configureStore({
  reducer: {
    auth: authSlice,
    season: seasonReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
