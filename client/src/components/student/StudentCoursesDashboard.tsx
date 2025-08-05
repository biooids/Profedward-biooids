"use client";

import { useGetMyStudentCoursesQuery } from "@/lib/course/courseApiSlice";
import { Loader2 } from "lucide-react";
import StudentCourseCard from "./StudentCourseCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function StudentCoursesDashboard() {
  const { data: courses, isLoading, isError } = useGetMyStudentCoursesQuery();

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
        <StudentCourseCard key={course.id} course={course} />
      ))}
      {courses?.length === 0 && (
        <p className="text-muted-foreground col-span-full text-center py-10">
          You are not yet enrolled in any courses.
        </p>
      )}
    </div>
  );
}
