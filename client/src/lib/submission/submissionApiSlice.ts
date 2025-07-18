import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../api/baseQueryWithReauth";
import {
  Submission,
  StudentSubmission,
  GetSubmissionsQueryDto,
  GradeSubmissionDto,
  SubmitWorkDto,
} from "./submissionTypes";

export const submissionApiSlice = createApi({
  reducerPath: "submissionApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["SubmissionList", "StudentSubmissionList"], // Updated tags
  endpoints: (builder) => ({
    // --- TEACHER HOOKS ---
    getTeacherSubmissions: builder.query<Submission[], GetSubmissionsQueryDto>({
      query: (params) => ({
        url: "/submissions/teacher",
        params,
      }),
      transformResponse: (response: { data: Submission[] }) => response.data,
      providesTags: ["SubmissionList"],
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
      invalidatesTags: ["SubmissionList", "StudentSubmissionList"],
    }),

    // --- STUDENT HOOKS ---
    getSubmissionsForStudent: builder.query<
      StudentSubmission[],
      GetSubmissionsQueryDto
    >({
      query: (params) => ({
        url: "/submissions/student",
        params,
      }),
      transformResponse: (response: { data: StudentSubmission[] }) =>
        response.data,
      providesTags: ["StudentSubmissionList"],
    }),

    submitWork: builder.mutation<
      void,
      { submissionId: string; data: SubmitWorkDto }
    >({
      query: ({ submissionId, data }) => ({
        url: `/submissions/${submissionId}/submit`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["StudentSubmissionList"],
    }),

    getPendingAssignmentsByCourse: builder.query<any[], void>({
      query: () => "/submissions/student/pending-by-course",
      transformResponse: (response: { data: any[] }) => response.data,
      // This list is invalidated whenever work is submitted
      providesTags: ["StudentSubmissionList"],
    }),
  }),
});

export const {
  useGetTeacherSubmissionsQuery,
  useGradeSubmissionMutation,
  useGetSubmissionsForStudentQuery, // <-- Student hook
  useSubmitWorkMutation, // <-- Student hook
  useGetPendingAssignmentsByCourseQuery,
} = submissionApiSlice;
