//src/components/student/StudentCoursesForAssignments.tsx
"use client";

import { useGetMyStudentCoursesQuery } from "@/lib/course/courseApiSlice";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function StudentCoursesForAssignments() {
  const { data: courses, isLoading, isError } = useGetMyStudentCoursesQuery();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !courses) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Could not load your courses.</AlertDescription>
      </Alert>
    );
  }

  if (courses.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-10">
        You are not enrolled in any courses.
      </p>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <Link
          key={course.id}
          href={`/assignments/${course.id}`}
          className="block"
        >
          <Card className="hover:border-primary transition-colors h-full">
            <CardHeader>
              <CardTitle>{course.subject.name}</CardTitle>
              <CardDescription>{course.academicLevel.name}</CardDescription>
            </CardHeader>
            <CardFooter>
              <p className="text-sm text-muted-foreground">View Assignments</p>
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  );
}
