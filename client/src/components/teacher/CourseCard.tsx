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
  return (
    <Link href={`/courses/${course.id}`}>
      <Card className="h-full hover:border-primary transition-colors">
        <CardHeader>
          <CardTitle>{course.title}</CardTitle>
          <CardDescription>{course.courseCode}</CardDescription>
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
