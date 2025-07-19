"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Book, FileText } from "lucide-react";

export default function PendingAssignmentCourseCard({
  course,
}: {
  course: any;
}) {
  // --- ADD THIS CONSOLE.LOG ---
  // This will show the data for the entire course card in your browser console.
  console.log("PendingAssignmentCourseCard received data:", course);
  console.log("PendingAssignmentCourseCard received course data:", course);

  const courseName = `${course.academicLevel.name} - ${course.subject.name}`;
  // --- THIS IS THE FIX ---
  // Get the teacher's name from the course data.
  const teacherName = course.teachers[0]?.displayName || "N/A";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Book className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>{courseName}</CardTitle>
            {/* Display the teacher's name here */}
            <CardDescription>
              {course.submissions.length} pending assignment(s) • Taught by{" "}
              {teacherName}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {course.submissions.map((sub: any) => (
            <Link key={sub.id} href={`/student/submission/${sub.id}`}>
              <div className="flex items-center p-3 rounded-lg hover:bg-muted transition-colors">
                <FileText className="h-5 w-5 mr-3 text-muted-foreground flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium">{sub.assignment.title}</p>
                </div>
                <p className="text-xs text-muted-foreground ml-4 text-right">
                  Due:{" "}
                  {sub.assignment.dueDate
                    ? new Date(sub.assignment.dueDate).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
