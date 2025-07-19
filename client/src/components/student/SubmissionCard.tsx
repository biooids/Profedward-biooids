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
import {
  StudentSubmission,
  SubmissionStatus,
} from "@/lib/submission/submissionTypes";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const statusStyles: Record<SubmissionStatus, string> = {
  [SubmissionStatus.PENDING]:
    "bg-yellow-500/10 text-yellow-700 border-yellow-500/20 hover:bg-yellow-500/20",
  [SubmissionStatus.SUBMITTED]:
    "bg-blue-500/10 text-blue-700 border-blue-500/20 hover:bg-blue-500/20",
  [SubmissionStatus.GRADED]:
    "bg-green-500/10 text-green-700 border-green-500/20 hover:bg-green-500/20",
  [SubmissionStatus.RESUBMITTED]:
    "bg-purple-500/10 text-purple-700 border-purple-500/20 hover:bg-purple-500/20",
};

export default function SubmissionCard({
  submission,
}: {
  submission: StudentSubmission;
}) {
  const courseName = `${submission.assignment.course.academicLevel.name} - ${submission.assignment.course.subject.name}`;
  const teacherName =
    submission.assignment.course.teachers[0]?.displayName || "N/A";
  const linkHref = `/student/submission/${submission.id}`;

  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <div>
            <Badge
              variant="outline"
              className={statusStyles[submission.status]}
            >
              {submission.status}
            </Badge>
            <CardTitle className="mt-2">
              {submission.assignment.title}
            </CardTitle>
            <CardDescription>
              {courseName} • Taught by {teacherName}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href={linkHref}>
              {"View Submission"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardFooter className="text-xs text-muted-foreground">
        Due:{" "}
        {submission.assignment.dueDate
          ? new Date(submission.assignment.dueDate).toLocaleDateString()
          : "No due date"}
      </CardFooter>
    </Card>
  );
}
