import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../api/baseQueryWithReauth";
import { User } from "../user/userTypes";
import { UpdateUserRoleDto, GetAllUsersApiResponse } from "./adminTypes";

export const adminApiSlice = createApi({
  reducerPath: "adminApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["UserList"], // Updated to use a simple string tag for the list
  endpoints: (builder) => ({
    // Query to get all users
    getAllUsers: builder.query<User[], void>({
      query: () => "/admin/users",
      transformResponse: (response: GetAllUsersApiResponse) => response.data,
      // This provides the tag for the entire list of users.
      providesTags: ["UserList"],
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
      // After updating a role, invalidate the list to trigger a refetch.
      invalidatesTags: ["UserList"],
    }),
  }),
});

export const { useGetAllUsersQuery, useUpdateUserRoleMutation } = adminApiSlice;
