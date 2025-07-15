// src/lib/auth/nextAuthSlice.ts

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Session } from "next-auth"; // Import the Session type

interface NextAuthState {
  session: Session | null;
}

const initialState: NextAuthState = {
  session: null,
};

const nextAuthSlice = createSlice({
  name: "nextAuth",
  initialState,
  reducers: {
    setSession(state, action: PayloadAction<Session | null>) {
      state.session = action.payload;
    },
    clearSession(state) {
      state.session = null;
    },
  },
});

export const { setSession, clearSession } = nextAuthSlice.actions;

export default nextAuthSlice.reducer;
