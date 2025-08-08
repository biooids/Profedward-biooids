//SRC/lib/course/courseApiSlice.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../api/baseQueryWithReauth";
import {
  Course,
  CreateCourseDto,
  EnrollStudentDto,
  CourseApiResponse,
  SetStudentEnrollmentDto,
  UpdateCourseDetailsDto,
} from "./courseTypes";

export const courseApiSlice = createApi({
  reducerPath: "courseApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Course", "UserList"],

  endpoints: (builder) => ({
    // ADD THIS QUERY
    getCourses: builder.query<Course[], void>({
      query: () => "/courses",

      transformResponse: (response: { data: Course[] }) => response.data,
      providesTags: (result = []) => [
        ...result.map(({ id }) => ({ type: "Course" as const, id })),
        { type: "Course", id: "LIST" },
      ],
    }),

    // Mutation to create a new course
    createCourse: builder.mutation<Course, CreateCourseDto>({
      query: (courseData) => ({
        url: "/courses",
        method: "POST",
        body: courseData,
      }),
      transformResponse: (response: CourseApiResponse) => response.data,
      invalidatesTags: [{ type: "Course", id: "LIST" }],
    }),

    // Mutation to enroll a student in a course
    enrollStudent: builder.mutation<
      Course,
      { courseId: string; data: EnrollStudentDto }
    >({
      query: ({ courseId, data }) => ({
        url: `/courses/${courseId}/enroll`,
        method: "POST",
        body: data,
      }),
      transformResponse: (response: CourseApiResponse) => response.data,
      invalidatesTags: (_result, _error, { courseId }) => [
        { type: "Course", id: courseId },
      ],
    }),

    getMyCourses: builder.query<Course[], void>({
      query: () => "/courses/my-courses",
      transformResponse: (response: { data: Course[] }) => response.data,
      providesTags: (result = []) => [
        ...result.map(({ id }) => ({ type: "Course" as const, id })),
        { type: "Course", id: "LIST" },
      ],
    }),

    getCourseDetailsForTeacher: builder.query<Course, string>({
      query: (courseId) => `/courses/${courseId}/teacher-view`,
      transformResponse: (response: { data: Course }) => response.data,
      providesTags: (_result, _error, courseId) => {
        // ADD THIS LOG
        console.log("PROVIDING TAG:", { type: "Course", id: courseId });
        return [{ type: "Course", id: courseId }];
      },
    }),

    getMyStudentCourses: builder.query<Course[], void>({
      query: () => "/courses/my-courses/student",
      transformResponse: (response: { data: Course[] }) => response.data,
      providesTags: (result = []) => [
        ...result.map(({ id }) => ({ type: "Course" as const, id })),
        { type: "Course", id: "LIST" },
      ],
    }),

    getCourseDetailsForStudent: builder.query<Course, string>({
      query: (courseId) => `/courses/${courseId}/student-view`,
      transformResponse: (response: { data: Course }) => response.data,
      providesTags: (_result, _error, courseId) => [
        { type: "Course", id: courseId },
      ],
    }),

    setStudentEnrollments: builder.mutation<
      Course[],
      { studentId: string; data: SetStudentEnrollmentDto }
    >({
      query: ({ studentId, data }) => ({
        url: `/courses/enrollments/${studentId}`,
        method: "PUT",
        body: data,
      }),
      // After updating enrollments, refetch the main course list
      // to update student counts on the admin dashboard.
      invalidatesTags: [{ type: "Course", id: "LIST" }, "UserList"],
    }),

    updateCourseDetails: builder.mutation<
      Course,
      { courseId: string; data: UpdateCourseDetailsDto }
    >({
      query: ({ courseId, data }) => ({
        url: `/courses/${courseId}/details`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { courseId }) => [
        { type: "Course", id: courseId },
      ],
    }),
  }),
});

export const {
  useGetCoursesQuery,
  useCreateCourseMutation,
  useEnrollStudentMutation,
  useGetMyCoursesQuery,
  useGetCourseDetailsForTeacherQuery,
  useGetMyStudentCoursesQuery,
  useGetCourseDetailsForStudentQuery,
  useSetStudentEnrollmentsMutation,
  useUpdateCourseDetailsMutation,
} = courseApiSlice;
