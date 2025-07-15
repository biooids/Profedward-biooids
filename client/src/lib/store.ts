// src/lib/store.ts

import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";

import userReducer from "./user/userSlice";
import nextAuthReducer from "./auth/nextAuthSlice";
import uploadProgressReducer from "./upload/uploadProgressSlice";
import ttsReducer from "./tts/ttsSlice";

import { userApiSlice } from "./user/userApiSlice";
import { shelfApiSlice } from "./shelf/shelfApiSlice";
import { documentApiSlice } from "./document/documentApiSlice";
import { aiApiSlice } from "./ai/aiApiSlice";
import { ttsApiSlice } from "./tts/ttsApiSlice";
import { adminApiSlice } from "./admin/adminApiSlice"; // <-- ADD THIS
import { courseApiSlice } from "./course/courseApiSlice"; // <-- ADD THIS
import { assignmentApiSlice } from "./assignment/assignmentApiSlice"; // <-- ADD THIS
import { submissionApiSlice } from "./submission/submissionApiSlice"; // <-- ADD THIS
import { academicApiSlice } from "./academic/academicApiSlice"; // <-- 1. IMPORT IT

export const store = configureStore({
  reducer: {
    user: userReducer,
    nextAuth: nextAuthReducer,
    uploadProgress: uploadProgressReducer,
    tts: ttsReducer,

    [userApiSlice.reducerPath]: userApiSlice.reducer,
    [shelfApiSlice.reducerPath]: shelfApiSlice.reducer,
    [documentApiSlice.reducerPath]: documentApiSlice.reducer,
    [aiApiSlice.reducerPath]: aiApiSlice.reducer,
    [ttsApiSlice.reducerPath]: ttsApiSlice.reducer,
    [adminApiSlice.reducerPath]: adminApiSlice.reducer, // <-- ADD THIS
    [courseApiSlice.reducerPath]: courseApiSlice.reducer, // <-- ADD THIS
    [assignmentApiSlice.reducerPath]: assignmentApiSlice.reducer, // <-- ADD THIS
    [submissionApiSlice.reducerPath]: submissionApiSlice.reducer, // <-- ADD THIS
    [academicApiSlice.reducerPath]: academicApiSlice.reducer, // <-- 2. ADD THE REDUCER
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // --- THIS IS THE FINAL FIX ---
        // We need to ignore both the action that carries the Blob
        // and the state path where the Blob is temporarily cached by RTK Query.
        ignoredActions: [
          `${documentApiSlice.reducerPath}/executeMutation/fulfilled`,
          `${ttsApiSlice.reducerPath}/executeMutation/fulfilled`, // <-- ADDED THIS
          `${ttsApiSlice.reducerPath}/executeMutation/pending`, // <-- ADDED THIS for safety
        ],
        ignoredPaths: [
          `${documentApiSlice.reducerPath}.mutations`,
          `${ttsApiSlice.reducerPath}.mutations`,
        ],
      },
    })
      .concat(userApiSlice.middleware)
      .concat(shelfApiSlice.middleware)
      .concat(documentApiSlice.middleware)
      .concat(aiApiSlice.middleware)
      .concat(ttsApiSlice.middleware)
      .concat(adminApiSlice.middleware) // <-- ADD THIS
      .concat(courseApiSlice.middleware) // <-- ADD THIS
      .concat(assignmentApiSlice.middleware) // <-- ADD THIS
      .concat(submissionApiSlice.middleware) // <-- ADD THIS
      .concat(academicApiSlice.middleware), // <-- 3. ADD THE MIDDLEWARE
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
