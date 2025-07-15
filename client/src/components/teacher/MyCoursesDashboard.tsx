"use client";

import { useGetMyCoursesQuery } from "@/lib/course/courseApiSlice";
import { useGetMyStudentCoursesQuery } from "@/lib/course/courseApiSlice"; // <-- Import new hook
import { useSession } from "next-auth/react"; // <-- Import useSession
import { UserRole } from "@/lib/user/userTypes";
import { Loader2 } from "lucide-react";
import CourseCard from "./CourseCard"; // We can reuse the CourseCard
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function MyCoursesDashboard() {
  const { data: session } = useSession();
  const userRole = session?.user?.userRole;

  // Conditionally call the correct hook based on the user's role
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
        <CourseCard key={course.id} course={course} />
      ))}
      {courses?.length === 0 && (
        <p className="text-muted-foreground col-span-full">
          You are not yet enrolled in any courses.
        </p>
      )}
    </div>
  );
}
