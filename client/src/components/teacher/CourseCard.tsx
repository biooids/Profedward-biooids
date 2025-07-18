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
import { UserRole } from "@/lib/user/userTypes"; // Import UserRole enum

interface CourseCardProps {
  course: Course;
  userRole?: UserRole; // Accept the user's role as a prop
}

export default function CourseCard({ course, userRole }: CourseCardProps) {
  // --- THIS IS THE FIX ---
  // The link is now dynamic based on the user's role.
  // It defaults to the student view if the role is not provided.
  const courseDetailUrl =
    userRole === UserRole.TEACHER
      ? `/courses/${course.id}/teacher-view`
      : `/courses/${course.id}/student-view`;

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
