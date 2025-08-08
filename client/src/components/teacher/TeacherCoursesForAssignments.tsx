"use client";
import { useGetMyCoursesQuery } from "@/lib/course/courseApiSlice";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { BookOpen } from "lucide-react";

// This component shows the list of courses on the main /assignments page
export default function TeacherCoursesForAssignments() {
  const { data: courses, isLoading } = useGetMyCoursesQuery();

  if (isLoading) return <Loader2 className="h-8 w-8 animate-spin" />;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {courses?.map((course) => (
        <Link
          key={course.id}
          href={`/assignments/${course.id}`}
          className="block"
        >
          <Card className="hover:border-primary transition-colors">
            <CardHeader>
              <CardTitle>{course.subject.name}</CardTitle>
              <CardDescription>{course.academicLevel.name}</CardDescription>
            </CardHeader>
            <CardFooter>
              <p className="text-sm text-muted-foreground">View Submissions</p>
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  );
}
