// src/lib/shelf/shelfApiSlice.ts

import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../api/baseQueryWithReauth";
import {
  Shelf,
  GetShelvesApiResponse,
  CreateShelfApiResponse,
  UpdateShelfApiResponse,
  CreateShelfDto,
  UpdateShelfDto,
} from "./shelfTypes";

export const shelfApiSlice = createApi({
  reducerPath: "shelfApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Shelf"],
  endpoints: (builder) => ({
    // Query to get all shelves for the logged-in user
    getShelves: builder.query<Shelf[], void>({
      query: () => "/shelves",
      transformResponse: (response: GetShelvesApiResponse) =>
        response.data.shelves,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Shelf" as const, id })),
              { type: "Shelf", id: "LIST" },
            ]
          : [{ type: "Shelf", id: "LIST" }],
    }),

    // Mutation to create a new shelf
    createShelf: builder.mutation<CreateShelfApiResponse, CreateShelfDto>({
      query: (newShelf) => ({
        url: "/shelves",
        method: "POST",
        body: newShelf,
      }),
      // After a new shelf is created, we want to refetch the list of all shelves.
      invalidatesTags: [{ type: "Shelf", id: "LIST" }],
    }),

    // Mutation to update a shelf's name
    updateShelf: builder.mutation<
      UpdateShelfApiResponse,
      { shelfId: string; data: UpdateShelfDto }
    >({
      query: ({ shelfId, data }) => ({
        url: `/shelves/${shelfId}`,
        method: "PATCH",
        body: data,
      }),
      // After updating, invalidate the specific shelf's cache and the main list.
      invalidatesTags: (_result, _error, { shelfId }) => [
        { type: "Shelf", id: shelfId },
        { type: "Shelf", id: "LIST" },
      ],
    }),

    // Mutation to delete a shelf
    deleteShelf: builder.mutation<void, string>({
      query: (shelfId) => ({
        url: `/shelves/${shelfId}`,
        method: "DELETE",
      }),
      // After deleting, invalidate the entire list of shelves.
      invalidatesTags: [{ type: "Shelf", id: "LIST" }],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetShelvesQuery,
  useCreateShelfMutation,
  useUpdateShelfMutation,
  useDeleteShelfMutation,
} = shelfApiSlice;
