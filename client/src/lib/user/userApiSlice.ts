import { createApi } from "@reduxjs/toolkit/query/react";
import { getSession } from "next-auth/react";
import { baseQueryWithReauth } from "../api/baseQueryWithReauth";
import {
  uploadStarted,
  uploadProgressUpdated,
  uploadSucceeded,
  uploadFailed,
} from "../upload/uploadProgressSlice";
import type { RootState } from "../store";
import type {
  SanitizedUserDto,
  GetMeApiResponse,
  UpdateProfileApiResponse,
  DeleteAccountApiResponse,
  PaginatedResponseDto,
} from "./userTypes";

export const userApiSlice = createApi({
  reducerPath: "userApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Me", "User"],
  endpoints: (builder) => ({
    getMe: builder.query<SanitizedUserDto, void>({
      query: () => ({ url: "/users/me", method: "GET" }),
      transformResponse: (response: GetMeApiResponse) => response.data.user,
      providesTags: ["Me"],
    }),

    updateMyProfile: builder.mutation<UpdateProfileApiResponse, FormData>({
      queryFn: async (formData, api) => {
        const file = formData.get("profileImage") as File | null;

        if (!file) {
          const result = await baseQueryWithReauth(
            { url: "/users/me", method: "PATCH", body: formData },
            api,
            {}
          );
          return result.error
            ? { error: result.error }
            : { data: result.data as UpdateProfileApiResponse };
        }

        const { getState, dispatch } = api;
        const fileName = file.name;

        // This inner function performs the actual upload via XMLHttpRequest
        const performUpload = (token: string | null | undefined) => {
          // <-- THE FIX IS HERE
          return new Promise<UpdateProfileApiResponse>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            const backendUrl = `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/users/me`;
            xhr.open("PATCH", backendUrl);
            if (token) {
              xhr.setRequestHeader("Authorization", `Bearer ${token}`);
            }

            xhr.upload.onprogress = (event) => {
              if (event.lengthComputable) {
                const progress = Math.round((event.loaded * 100) / event.total);
                dispatch(uploadProgressUpdated(progress));
              }
            };

            xhr.onload = () => {
              const response = JSON.parse(xhr.responseText);
              if (xhr.status >= 200 && xhr.status < 300) {
                dispatch(uploadSucceeded());
                resolve(response);
              } else {
                dispatch(uploadFailed(response.message || "Upload failed"));
                reject({ status: xhr.status, data: response });
              }
            };

            xhr.onerror = () => {
              const errorMsg = "A network error occurred during upload.";
              dispatch(uploadFailed(errorMsg));
              reject({ status: "NETWORK_ERROR", data: { message: errorMsg } });
            };

            xhr.send(formData);
          });
        };

        // Main logic for the queryFn
        try {
          dispatch(uploadStarted(fileName));
          const initialToken = (getState() as RootState).nextAuth.session
            ?.backendAccessToken;

          const result = await performUpload(initialToken);
          return { data: result };
        } catch (error: any) {
          if (error.status === 401) {
            console.log(
              "[UpdateProfile/queryFn] Received 401, attempting refresh..."
            );
            const newSession = await getSession();

            if (newSession?.backendAccessToken) {
              console.log(
                "[UpdateProfile/queryFn] Refresh successful, retrying upload..."
              );
              try {
                const retryResult = await performUpload(
                  newSession.backendAccessToken
                );
                return { data: retryResult };
              } catch (retryError: any) {
                return {
                  error: { status: retryError.status, data: retryError.data },
                };
              }
            } else {
              dispatch(
                uploadFailed("Session expired and could not be refreshed.")
              );
              return { error: { status: 401, data: "Session expired." } };
            }
          }
          dispatch(
            uploadFailed(error?.data?.message || "An unknown error occurred.")
          );
          return { error: { status: error.status, data: error.data } };
        }
      },
      invalidatesTags: ["Me"],
    }),

    deleteMyAccount: builder.mutation<DeleteAccountApiResponse, void>({
      query: () => ({ url: "/users/me", method: "DELETE" }),
      invalidatesTags: ["Me"],
    }),

    discoverUsers: builder.query<
      PaginatedResponseDto<SanitizedUserDto>,
      { searchTerm?: string; page?: number; limit?: number } | void
    >({
      query: (params) => {
        const searchParams = new URLSearchParams(
          params as Record<string, string>
        );
        return `/users?${searchParams.toString()}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "User" as const, id })),
              { type: "User", id: "LIST" },
            ]
          : [{ type: "User", id: "LIST" }],
    }),
  }),
});

export const {
  useGetMeQuery,
  useUpdateMyProfileMutation,
  useDeleteMyAccountMutation,
  useDiscoverUsersQuery,
} = userApiSlice;
