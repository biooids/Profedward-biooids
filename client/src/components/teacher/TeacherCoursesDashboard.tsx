//src/components/teacher/TeacherCoursesDashboard.tsx
"use client";

import { useGetMyCoursesQuery } from "@/lib/course/courseApiSlice";
import { Loader2 } from "lucide-react";
// --- THIS IS THE FIX ---
// Remove the .jsx extension. Let the build system find the correct .tsx file.
import TeacherCourseCard from "./TeacherCourseCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Also, let's rename the component to be more specific as we discussed
export default function TeacherCoursesDashboard() {
  const { data: courses, isLoading, isError } = useGetMyCoursesQuery();

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
        <TeacherCourseCard key={course.id} course={course} />
      ))}
      {courses?.length === 0 && (
        <p className="text-muted-foreground col-span-full text-center py-10">
          You have not been assigned to any courses yet.
        </p>
      )}
    </div>
  );
}
