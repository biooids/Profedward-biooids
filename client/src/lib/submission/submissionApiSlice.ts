import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../api/baseQueryWithReauth";
import {
  Submission,
  GetSubmissionsQueryDto,
  GradeSubmissionDto,
} from "./submissionTypes";

export const submissionApiSlice = createApi({
  reducerPath: "submissionApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Submission"],
  endpoints: (builder) => ({
    getTeacherSubmissions: builder.query<Submission[], GetSubmissionsQueryDto>({
      query: (params) => ({
        url: "/submissions/teacher",
        params, // e.g., { status: 'SUBMITTED' }
      }),
      transformResponse: (response: { data: Submission[] }) => response.data,
      providesTags: (result = []) => [
        ...result.map(({ id }) => ({ type: "Submission" as const, id })),
        { type: "Submission", id: "LIST" },
      ],
    }),

    gradeSubmission: builder.mutation<
      void,
      { submissionId: string; data: GradeSubmissionDto }
    >({
      query: ({ submissionId, data }) => ({
        url: `/submissions/${submissionId}/correct`,
        method: "POST",
        body: data,
      }),
      // After grading, invalidate the list to remove it from the "Ready to Grade" tab
      invalidatesTags: [{ type: "Submission", id: "LIST" }],
    }),
  }),
});

export const { useGetTeacherSubmissionsQuery, useGradeSubmissionMutation } =
  submissionApiSlice;
