// src/lib/academic/academicApiSlice.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../api/baseQueryWithReauth";
import { AcademicLevel, Subject } from "../course/courseTypes";

type IdAndName = { id: string; name: string };

export const academicApiSlice = createApi({
  reducerPath: "academicApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["AcademicLevel", "Subject"],
  endpoints: (builder) => ({
    getAcademicLevels: builder.query<AcademicLevel[], void>({
      query: () => "/academic/levels",
      transformResponse: (response: { data: AcademicLevel[] }) => response.data,
      providesTags: (result = []) => [
        ...result.map(({ id }) => ({ type: "AcademicLevel" as const, id })),
        { type: "AcademicLevel", id: "LIST" },
      ],
    }),
    getSubjects: builder.query<Subject[], void>({
      query: () => "/academic/subjects",
      transformResponse: (response: { data: Subject[] }) => response.data,
      providesTags: (result = []) => [
        ...result.map(({ id }) => ({ type: "Subject" as const, id })),
        { type: "Subject", id: "LIST" },
      ],
    }),
    createAcademicLevel: builder.mutation<AcademicLevel, { name: string }>({
      query: (body) => ({ url: "/academic/levels", method: "POST", body }),
      invalidatesTags: [{ type: "AcademicLevel", id: "LIST" }],
    }),
    createSubject: builder.mutation<Subject, { name: string }>({
      query: (body) => ({ url: "/academic/subjects", method: "POST", body }),
      invalidatesTags: [{ type: "Subject", id: "LIST" }],
    }),

    updateAcademicLevel: builder.mutation<
      AcademicLevel,
      { id: string; data: { name: string } }
    >({
      query: ({ id, data }) => ({
        url: `/academic/levels/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "AcademicLevel", id },
      ],
    }),
    deleteAcademicLevel: builder.mutation<
      { success: boolean; id: string },
      string
    >({
      query: (id) => ({ url: `/academic/levels/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "AcademicLevel", id: "LIST" }],
    }),
    updateSubject: builder.mutation<
      Subject,
      { id: string; data: { name: string } }
    >({
      query: ({ id, data }) => ({
        url: `/academic/subjects/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "Subject", id }],
    }),
    deleteSubject: builder.mutation<{ success: boolean; id: string }, string>({
      query: (id) => ({ url: `/academic/subjects/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Subject", id: "LIST" }],
    }),
  }),
});

export const {
  useGetAcademicLevelsQuery,
  useGetSubjectsQuery,
  useCreateAcademicLevelMutation,
  useCreateSubjectMutation,
  useUpdateAcademicLevelMutation,
  useDeleteAcademicLevelMutation,
  useUpdateSubjectMutation,
  useDeleteSubjectMutation,
} = academicApiSlice;
