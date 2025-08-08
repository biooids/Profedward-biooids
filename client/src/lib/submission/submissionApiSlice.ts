//src/lib/submission/submissionApiSlice.ts

import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../api/baseQueryWithReauth";
import {
  Submission,
  StudentSubmission,
  GetSubmissionsQueryDto,
  GradeSubmissionDto,
  SubmitWorkDto,
  SaveDraftDto,
  SaveGradingDraftDto,
} from "./submissionTypes";

export const submissionApiSlice = createApi({
  reducerPath: "submissionApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["SubmissionList", "StudentSubmissionList", "StudentSubmission"],
  endpoints: (builder) => ({
    // --- TEACHER HOOKS ---
    getTeacherSubmissions: builder.query<Submission[], GetSubmissionsQueryDto>({
      query: (params) => ({ url: "/submissions/teacher", params }),
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
      query: (params) => ({ url: "/submissions/student", params }),
      transformResponse: (response: { data: StudentSubmission[] }) =>
        response.data,
      providesTags: ["StudentSubmissionList"],
    }),

    // --- ADD THIS NEW QUERY ---
    findOrCreateSubmission: builder.query<StudentSubmission, string>({
      query: (assignmentId) =>
        `/submissions/assignment/${assignmentId}/student`,
      transformResponse: (response: { data: StudentSubmission }) =>
        response.data,
      providesTags: (result) =>
        result ? [{ type: "StudentSubmission", id: result.id }] : [],
    }),

    // --- ADD THIS NEW MUTATION ---
    saveDraft: builder.mutation<
      void,
      { submissionId: string; data: SaveDraftDto }
    >({
      query: ({ submissionId, data }) => ({
        url: `/submissions/${submissionId}/draft`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { submissionId }) => [
        { type: "StudentSubmission", id: submissionId },
      ],
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
      invalidatesTags: ["StudentSubmissionList", "StudentSubmission"],
    }),

    getPendingAssignmentsByCourse: builder.query<any[], void>({
      query: () => "/submissions/student/pending-by-course",
      transformResponse: (response: { data: any[] }) => response.data,
      providesTags: ["StudentSubmissionList"],
    }),

    getSubmissionForGrading: builder.query<StudentSubmission, string>({
      query: (submissionId) => `/submissions/${submissionId}/teacher`,
      transformResponse: (response: { data: StudentSubmission }) =>
        response.data,
      providesTags: (_result, _error, id) => [
        { type: "StudentSubmission", id },
      ],
    }),
    getGradedSubmission: builder.query<StudentSubmission, string>({
      query: (submissionId) =>
        `/submissions/${submissionId}/graded-student-view`,
      transformResponse: (response: { data: StudentSubmission }) =>
        response.data,
    }),

    saveGradingDraft: builder.mutation<
      void,
      { submissionId: string; data: SaveGradingDraftDto }
    >({
      query: ({ submissionId, data }) => ({
        url: `/submissions/${submissionId}/save-grade`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { submissionId }) => [
        { type: "StudentSubmission", id: submissionId },
      ],
    }),
  }),
});

export const {
  useGetTeacherSubmissionsQuery,
  useGradeSubmissionMutation,
  useGetSubmissionsForStudentQuery,
  useSubmitWorkMutation,
  useGetPendingAssignmentsByCourseQuery,
  useFindOrCreateSubmissionQuery,
  useSaveDraftMutation,
  useGetSubmissionForGradingQuery,
  useGetGradedSubmissionQuery,
  useSaveGradingDraftMutation,
} = submissionApiSlice;
