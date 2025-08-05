"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FileText, UserCircle } from "lucide-react";
import { Course } from "@/lib/course/courseTypes";
import { cn } from "@/lib/utils";

interface StudentCourseCardProps {
  course: Course;
}

// Helper to get a consistent color based on subject name
const getSubjectColor = (subjectName: string) => {
  let hash = 0;
  for (let i = 0; i < subjectName.length; i++) {
    hash = subjectName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    "bg-red-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-teal-500",
  ];
  return colors[Math.abs(hash) % colors.length];
};

const AvatarGroup = ({
  students,
}: {
  students: { profileImage?: string | null; displayName?: string | null }[];
}) => {
  // --- THIS IS THE FIX: Add the missing implementation ---
  const displayedStudents = students.slice(0, 3);
  const remainingCount = students.length - displayedStudents.length;

  return (
    <div className="flex items-center">
      <div className="flex -space-x-2 overflow-hidden">
        {displayedStudents.map((student, index) => (
          <Avatar
            key={index}
            className="inline-block h-6 w-6 rounded-full ring-2 ring-background"
          >
            <AvatarImage src={student.profileImage ?? ""} />
            <AvatarFallback>{student.displayName?.charAt(0)}</AvatarFallback>
          </Avatar>
        ))}
      </div>
      {remainingCount > 0 && (
        <div className="z-10 flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground ring-2 ring-background">
          +{remainingCount}
        </div>
      )}
    </div>
  );
};

export default function StudentCourseCard({ course }: StudentCourseCardProps) {
  const courseDetailUrl = `/courses/${course.id}/student-view`;
  const accentColor = getSubjectColor(course.subject.name);
  const teacherName = course.teachers?.[0]?.displayName || "N/A";

  return (
    <Link href={courseDetailUrl} className="block group">
      <Card className="h-full flex flex-col transition-all duration-200 group-hover:border-primary group-hover:shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div>
              <CardDescription>{course.academicLevel.name}</CardDescription>
              <CardTitle className="text-xl">{course.subject.name}</CardTitle>
            </div>
            <div className={cn("h-3 w-3 rounded-full", accentColor)} />
          </div>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col justify-end gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground border-t pt-4">
            <UserCircle className="h-4 w-4" />
            <span>Taught by {teacherName}</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <AvatarGroup students={course.students || []} />
              <span>{course._count.students} Students</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>{course._count.assignments} Assignments</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
