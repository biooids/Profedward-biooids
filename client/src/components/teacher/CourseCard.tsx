"use client";

import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Users, FileText } from "lucide-react";
import { Course } from "@/lib/course/courseTypes";

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  // --- THIS IS THE FIX ---
  // The link now points to the correct teacher-specific detail page.
  const courseDetailUrl = `/courses/${course.id}/teacher-view`;

  return (
    <Link href={courseDetailUrl}>
      <Card className="h-full hover:border-primary transition-colors">
        <CardHeader>
          <CardTitle>{course.subject.name}</CardTitle>
          <CardDescription>{course.academicLevel.name}</CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{course._count.students} Students</span>
          </div>
          <div className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            <span>{course._count.assignments} Assignments</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
