import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../api/baseQueryWithReauth";
import { AcademicLevel, Subject } from "../course/courseTypes";

export const academicApiSlice = createApi({
  reducerPath: "academicApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["AcademicLevel", "Subject"], // Add tags for caching
  endpoints: (builder) => ({
    getAcademicLevels: builder.query<AcademicLevel[], void>({
      query: () => "/academic/levels",
      transformResponse: (response: { data: AcademicLevel[] }) => response.data,
      providesTags: ["AcademicLevel"],
    }),
    getSubjects: builder.query<Subject[], void>({
      query: () => "/academic/subjects",
      transformResponse: (response: { data: Subject[] }) => response.data,
      providesTags: ["Subject"],
    }),

    // --- ADD THESE NEW MUTATIONS ---
    createAcademicLevel: builder.mutation<AcademicLevel, { name: string }>({
      query: (body) => ({
        url: "/academic/levels",
        method: "POST",
        body,
      }),
      invalidatesTags: ["AcademicLevel"], // On success, refetch the list of levels
    }),
    createSubject: builder.mutation<Subject, { name: string }>({
      query: (body) => ({
        url: "/academic/subjects",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Subject"], // On success, refetch the list of subjects
    }),
  }),
});

export const {
  useGetAcademicLevelsQuery,
  useGetSubjectsQuery,
  useCreateAcademicLevelMutation, // Export new hooks
  useCreateSubjectMutation, // Export new hooks
} = academicApiSlice;
