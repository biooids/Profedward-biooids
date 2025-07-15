// src/components/auth/NextAuthSync.tsx
"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { setSession } from "@/lib/auth/nextAuthSlice";
import { useAppDispatch } from "@/lib/hooks";

/**
 * This component's sole responsibility is to keep the Redux 'nextAuth' slice
 * in sync with the client-side session state from NextAuth's useSession hook.
 * It should be placed in the root layout.
 */
export function NextAuthSync() {
  const { data: session } = useSession();
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Whenever the session object changes, update our Redux store
    dispatch(setSession(session));
  }, [session, dispatch]);

  return null; // This component renders nothing
}
