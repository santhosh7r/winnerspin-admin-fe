import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  username: string | null;
}

const initialState: AuthState = {
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  username: null,
};

// Async thunk for login
export const loginAdmin = createAsyncThunk(
  "auth/loginAdmin",
  async ({ username, password }: { username: string; password: string }) => {
    // const response = await fetch("https://api.winnerspin.in.net/admin/login", {
    const response = await fetch("http://localhost:3000/admin/login", {

      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error("Login failed");
    }

    const data = await response.json();
    return data;
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.token = null;
      state.isAuthenticated = false;
      state.username = null;
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUsername");
    },
    loadFromStorage: (state) => {
      const token = localStorage.getItem("adminToken");
      const username = localStorage.getItem("adminUsername");
      if (token) {
        state.token = token;
        state.isAuthenticated = true;
        state.username = username;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.username = action.payload.message.split(" ")[4]; // Extract username from message
        localStorage.setItem("adminToken", action.payload.token);
        localStorage.setItem("adminUsername", state.username || "");
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Login failed";
      });
  },
});

export const { logout, loadFromStorage, clearError } = authSlice.actions;
export default authSlice.reducer;
