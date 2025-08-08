//src/components/student/PendingAssignmentCard.tsx
"use client";

import Link from "next/link";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Assignment } from "@/lib/assignment/assignmentTypes";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const statusStyle =
  "border-yellow-500/20 bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/20";

export default function PendingAssignmentCard({
  assignment,
}: {
  assignment: Assignment;
}) {
  const courseName = `${assignment.course.academicLevel.name} - ${assignment.course.subject.name}`;
  const teacherName = assignment.course.teachers[0]?.displayName || "N/A";

  // --- THIS IS THE FIX ---
  // Restoring the correct, nested URL path
  const linkHref = `/courses/${assignment.courseId}/assignments/${assignment.id}/student-view`;

  return (
    <Card className="hover:border-primary/50 transition-colors">
      <Link href={linkHref} className="h-full flex flex-col">
        <CardHeader>
          <div className="flex justify-between items-start gap-4">
            <div>
              <Badge variant="outline" className={cn(statusStyle)}>
                PENDING
              </Badge>
              <CardTitle className="mt-2">{assignment.title}</CardTitle>
              <CardDescription>
                {courseName} • Taught by {teacherName}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardFooter className="flex justify-between items-center mt-auto">
          <p className="text-xs text-muted-foreground">
            Due:{" "}
            {assignment.dueDate
              ? new Date(assignment.dueDate).toLocaleDateString()
              : "No due date"}
          </p>
          <div className="flex items-center text-primary text-sm font-semibold">
            Start Assignment
            <ArrowRight className="ml-2 h-4 w-4" />
          </div>
        </CardFooter>
      </Link>
    </Card>
  );
}
