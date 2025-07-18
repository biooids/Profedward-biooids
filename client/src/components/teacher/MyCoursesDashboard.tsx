"use client";

import {
  useGetMyCoursesQuery,
  useGetMyStudentCoursesQuery,
} from "@/lib/course/courseApiSlice";
import { useSession } from "next-auth/react";
import { UserRole } from "@/lib/user/userTypes";
import { Loader2 } from "lucide-react";
import CourseCard from "../teacher/CourseCard"; // Updated path if you moved it
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function MyCoursesDashboard() {
  const { data: session } = useSession();
  const userRole = session?.user?.userRole;

  const {
    data: teacherCourses,
    isLoading: isTeacherLoading,
    isError: isTeacherError,
  } = useGetMyCoursesQuery(undefined, {
    skip: userRole !== UserRole.TEACHER,
  });

  const {
    data: studentCourses,
    isLoading: isStudentLoading,
    isError: isStudentError,
  } = useGetMyStudentCoursesQuery(undefined, {
    skip: userRole !== UserRole.STUDENT,
  });

  const isLoading = isTeacherLoading || isStudentLoading;
  const isError = isTeacherError || isStudentError;
  const courses = teacherCourses || studentCourses;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load your courses. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {courses?.map((course) => (
        // THIS IS THE FIX: We pass the user's role to each card
        <CourseCard key={course.id} course={course} userRole={userRole} />
      ))}
      {courses?.length === 0 && (
        <p className="text-muted-foreground col-span-full text-center py-10">
          You are not yet enrolled in or assigned to any courses.
        </p>
      )}
    </div>
  );
}
