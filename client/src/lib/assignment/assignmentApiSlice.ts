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
  tagTypes: ["Assignment", "Course"], // We also tag Course to update the course detail page
  endpoints: (builder) => ({
    createAssignment: builder.mutation<Assignment, CreateAssignmentDto>({
      query: (assignmentData) => ({
        url: "/assignments",
        method: "POST",
        body: assignmentData,
      }),
      transformResponse: (response: AssignmentApiResponse) => response.data,
      // When an assignment is created, invalidate the course it belongs to
      // to refetch the assignment list on the course detail page.
      invalidatesTags: (_result, _error, { courseId }) => [
        { type: "Course", id: courseId },
      ],
    }),
  }),
});

export const { useCreateAssignmentMutation } = assignmentApiSlice;
