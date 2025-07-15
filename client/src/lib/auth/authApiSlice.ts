import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../api/baseQueryWithReauth";
import { AuthResponse, DevLoginDto } from "./authTypes"; // Import the new types

export const authApiSlice = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    // ... (keep your existing login, register, etc. mutations)

    /**
     * [DEVELOPMENT ONLY]
     * A mutation to perform a passwordless login for a specific user.
     * This should only be exposed in a development environment.
     */
    devLogin: builder.mutation<AuthResponse, DevLoginDto>({
      query: (credentials) => ({
        url: "/auth/dev-login",
        method: "POST",
        body: credentials,
      }),
    }),
  }),
});

// Add the new hook to your exports
export const {
  useDevLoginMutation, // <-- ADD THIS
} = authApiSlice;
