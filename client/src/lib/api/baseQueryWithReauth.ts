// src/lib/api/baseQueryWithReauth.ts

import {
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import { getSession, signOut } from "next-auth/react";
import type { RootState } from "../store";

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_BACKEND_API_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).nextAuth.session
      ?.backendAccessToken;
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

// A simple promise-based mutex to ensure only one session refresh happens at a time.
let refreshPromise: Promise<any> | null = null;

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  // Wait for any ongoing refresh to complete before making the initial request.
  if (refreshPromise) {
    await refreshPromise;
  }

  let result = await baseQuery(args, api, extraOptions);

  // Check if the request failed with a 401 Unauthorized error
  if (result.error && result.error.status === 401) {
    // If there isn't already a refresh in progress, start one.
    if (!refreshPromise) {
      console.log(
        "[RTK Reauth] Received 401. Triggering single session refresh..."
      );
      // Let NextAuth handle the token refresh logic by calling getSession().
      // This will use the logic defined in your [...nextauth].ts file.
      refreshPromise = getSession();
    }

    try {
      // Wait for the single refresh process to complete.
      const newSession = await refreshPromise;

      if (newSession) {
        console.log(
          "[RTK Reauth] Session refresh successful. Retrying original request."
        );
        // Retry the original request. The `useSession` hook will have updated the
        // session in the background, so the next `getState()` call in `prepareHeaders`
        // will get the new token.
        result = await baseQuery(args, api, extraOptions);
      } else {
        // If getSession() returns null, the refresh failed permanently.
        throw new Error("Session refresh failed, getSession returned null.");
      }
    } catch (error) {
      console.error(
        "[RTK Reauth] Critical session refresh failure. Forcing sign out.",
        error
      );
      signOut({ callbackUrl: "/auth/login?error=SessionExpired" });
      // Return the original error to prevent the component from trying to render.
      return result;
    } finally {
      // Always clear the lock after the process is complete, allowing for future refreshes.
      refreshPromise = null;
    }
  }

  return result;
};
