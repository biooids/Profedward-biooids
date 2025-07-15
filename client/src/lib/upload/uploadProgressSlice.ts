import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UploadProgressState {
  progress: number; // 0-100
  isUploading: boolean;
  error: string | null;
  fileName: string | null;
}

const initialState: UploadProgressState = {
  progress: 0,
  isUploading: false,
  error: null,
  fileName: null,
};

const uploadProgressSlice = createSlice({
  name: "uploadProgress",
  initialState,
  reducers: {
    uploadStarted: (state, action: PayloadAction<string>) => {
      state.isUploading = true;
      state.progress = 0;
      state.error = null;
      state.fileName = action.payload;
    },
    uploadProgressUpdated: (state, action: PayloadAction<number>) => {
      if (state.isUploading) {
        state.progress = action.payload;
      }
    },
    uploadSucceeded: (state) => {
      state.isUploading = false;
      state.progress = 100;
    },
    uploadFailed: (state, action: PayloadAction<string>) => {
      state.isUploading = false;
      state.error = action.payload;
    },
    resetUploadState: () => initialState,
  },
});

export const {
  uploadStarted,
  uploadProgressUpdated,
  uploadSucceeded,
  uploadFailed,
  resetUploadState,
} = uploadProgressSlice.actions;

export default uploadProgressSlice.reducer;
