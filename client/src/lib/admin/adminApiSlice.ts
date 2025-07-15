import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../api/baseQueryWithReauth";
import { User } from "../user/userTypes";
import { UpdateUserRoleDto, GetAllUsersApiResponse } from "./adminTypes";

export const adminApiSlice = createApi({
  reducerPath: "adminApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["User"], // Tag for caching user data
  endpoints: (builder) => ({
    // Query to get all users
    getAllUsers: builder.query<User[], void>({
      query: () => "/admin/users",
      transformResponse: (response: GetAllUsersApiResponse) => response.data,
      providesTags: (result = []) => [
        ...result.map(({ id }) => ({ type: "User" as const, id })),
        { type: "User", id: "LIST" },
      ],
    }),

    // Mutation to update a user's role
    updateUserRole: builder.mutation<
      User,
      { userId: string; data: UpdateUserRoleDto }
    >({
      query: ({ userId, data }) => ({
        url: `/admin/users/${userId}/role`,
        method: "PATCH",
        body: data,
      }),
      // After updating, invalidate the user list to trigger a refetch
      invalidatesTags: (_result, _error, { userId }) => [
        { type: "User", id: "LIST" },
        { type: "User", id: userId },
      ],
    }),
  }),
});

export const { useGetAllUsersQuery, useUpdateUserRoleMutation } = adminApiSlice;
