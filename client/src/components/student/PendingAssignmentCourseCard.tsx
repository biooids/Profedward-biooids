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
  const courseName = `${course.academicLevel.name} - ${course.subject.name}`;

  // --- THIS IS THE FIX ---
  // We now flatten the nested submissions into a single list to display.
  // This gets all the pending submissions for this course.
  const pendingSubmissions = course.assignments.flatMap(
    (a: any) => a.submissions
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Book className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>{courseName}</CardTitle>
            <CardDescription>
              {pendingSubmissions.length} pending assignment(s)
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {pendingSubmissions.map((sub: any) => (
            <Link key={sub.id} href={`/student/submission/${sub.id}`}>
              <div className="flex items-center p-3 rounded-lg hover:bg-muted transition-colors">
                <FileText className="h-5 w-5 mr-3 text-muted-foreground flex-shrink-0" />
                <div className="flex-1">
                  {/* The assignment title is now nested inside the submission */}
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
