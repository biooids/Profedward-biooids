import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../api/baseQueryWithReauth";
import {
  Assignment,
  CreateAssignmentDto,
  AssignmentApiResponse,
} from "./assignmentTypes";

export const assignmentApiSlice = createApi({
  reducerPath: "assignmentApi",
  baseQuery: baseQueryWithReauth,
  // Define the tags this slice can invalidate
  tagTypes: ["Assignment", "Course"],
  endpoints: (builder) => ({
    createAssignment: builder.mutation<Assignment, CreateAssignmentDto>({
      query: (assignmentData) => ({
        url: "/assignments",
        method: "POST",
        body: assignmentData,
      }),
      transformResponse: (response: AssignmentApiResponse) => response.data,
      invalidatesTags: (_result, _error, { courseId }) => {
        // ADD THIS LOG
        console.log("INVALIDATING TAG:", { type: "Course", id: courseId });
        return [{ type: "Course", id: courseId }];
      },
    }),

    getAssignmentById: builder.query<Assignment, string>({
      query: (assignmentId) => `/assignments/${assignmentId}`,
      transformResponse: (response: AssignmentApiResponse) => response.data,
      providesTags: (_result, _error, assignmentId) => [
        { type: "Assignment", id: assignmentId },
      ],
    }),
    getAssignmentForStudent: builder.query<Assignment, string>({
      query: (assignmentId) => `/assignments/${assignmentId}/student`,
      transformResponse: (response: AssignmentApiResponse) => response.data,
      providesTags: (_result, _error, assignmentId) => [
        { type: "Assignment", id: assignmentId },
      ],
    }),
  }),
});

export const {
  useCreateAssignmentMutation,
  useGetAssignmentByIdQuery,
  useGetAssignmentForStudentQuery, // <-- EXPORT NEW HOOK
} = assignmentApiSlice;
