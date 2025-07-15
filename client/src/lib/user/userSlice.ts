import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import { userApiSlice } from "./userApiSlice";
import {
  type CurrentUser,
  type SanitizedUserDto,
  type UsersState,
  type UpdateProfileApiResponse,
} from "./userTypes";

const initialState: UsersState = {
  currentUser: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // This action can be used for things like optimistic updates if needed
    setCurrentUser: (state, action: PayloadAction<CurrentUser | null>) => {
      state.currentUser = action.payload;
    },
    // This action should be dispatched when the user logs out
    clearUserStateOnLogout: (state) => {
      state.currentUser = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // When the getMe query succeeds, populate the currentUser state
      .addMatcher(
        userApiSlice.endpoints.getMe.matchFulfilled,
        (state, action: PayloadAction<SanitizedUserDto>) => {
          state.currentUser = action.payload;
        }
      )
      // When the updateMyProfile mutation succeeds, update the currentUser state
      .addMatcher(
        userApiSlice.endpoints.updateMyProfile.matchFulfilled,
        (state, action: PayloadAction<UpdateProfileApiResponse>) => {
          if (action.payload.data?.user) {
            state.currentUser = action.payload.data.user;
          }
        }
      )
      // When the deleteMyAccount mutation succeeds, clear the user state
      .addMatcher(
        userApiSlice.endpoints.updateMyProfile.matchFulfilled,
        (state, action: PayloadAction<UpdateProfileApiResponse>) => {
          // Check if the backend sent back the updated user object in its response
          if (action.payload.data?.user) {
            // If it did, update our 'currentUser' state with this new, fresh data
            state.currentUser = action.payload.data.user;
          }
        }
      );
  },
});

export const { setCurrentUser, clearUserStateOnLogout } = userSlice.actions;

// --- EXPORTED SELECTORS ---
export const selectCurrentUser = (state: RootState) => state.user.currentUser;
export const selectCurrentUserId = (state: RootState) =>
  state.user.currentUser?.id ?? null;

export default userSlice.reducer;
