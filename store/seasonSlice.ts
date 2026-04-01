import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SeasonState {
  id: string;
  name: string;
}

const initialState: SeasonState = {
  id: typeof window !== "undefined" ? localStorage.getItem("selectedSeason") || "" : "",
  name: typeof window !== "undefined" ? localStorage.getItem("selectedSeasonName") || "" : "",
};

const seasonSlice = createSlice({
  name: "season",
  initialState,
  reducers: {
    setSeason: (state, action: PayloadAction<{ id: string; name: string }>) => {
      state.id = action.payload.id;
      state.name = action.payload.name;
      if (typeof window !== "undefined") {
        localStorage.setItem("selectedSeason", action.payload.id);
        localStorage.setItem("selectedSeasonName", action.payload.name);
      }
    },
    clearSeason: (state) => {
      state.id = "";
      state.name = "";
      if (typeof window !== "undefined") {
        localStorage.removeItem("selectedSeason");
        localStorage.removeItem("selectedSeasonName");
      }
    },
  },
});

export const { setSeason, clearSeason } = seasonSlice.actions;
export default seasonSlice.reducer;
