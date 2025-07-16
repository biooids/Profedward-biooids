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
import { adminApiSlice } from "./admin/adminApiSlice";
import { courseApiSlice } from "./course/courseApiSlice";
import { assignmentApiSlice } from "./assignment/assignmentApiSlice";
import { submissionApiSlice } from "./submission/submissionApiSlice";
import { academicApiSlice } from "./academic/academicApiSlice";

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
    [adminApiSlice.reducerPath]: adminApiSlice.reducer,
    [courseApiSlice.reducerPath]: courseApiSlice.reducer,
    [assignmentApiSlice.reducerPath]: assignmentApiSlice.reducer,
    [submissionApiSlice.reducerPath]: submissionApiSlice.reducer,
    [academicApiSlice.reducerPath]: academicApiSlice.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          `${documentApiSlice.reducerPath}/executeMutation/fulfilled`,
          `${ttsApiSlice.reducerPath}/executeMutation/fulfilled`,
          `${ttsApiSlice.reducerPath}/executeMutation/pending`,
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
      .concat(adminApiSlice.middleware)
      .concat(courseApiSlice.middleware)
      .concat(assignmentApiSlice.middleware)
      .concat(submissionApiSlice.middleware)
      .concat(academicApiSlice.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
