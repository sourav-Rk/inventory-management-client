 import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "../../types/auth.types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

const getUserFromStorage = (): User | null => {
  const user = localStorage.getItem("user");
  if (user) {
    try {
      return JSON.parse(user) as User;
    } catch {
      return null;
    }
  }
  return null;
};

const initialState: AuthState = {
  user: getUserFromStorage(),
  isAuthenticated: !!localStorage.getItem("accessToken"),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem("user", JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    },
  },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;
