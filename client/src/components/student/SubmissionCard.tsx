//src/components/student/SubmissionCard.tsx

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
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const statusStyles: Record<SubmissionStatus, string> = {
  [SubmissionStatus.PENDING]:
    "border-yellow-500/20 bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/20",
  [SubmissionStatus.SUBMITTED]:
    "border-blue-500/20 bg-blue-500/10 text-blue-700 hover:bg-blue-500/20",
  [SubmissionStatus.GRADED]:
    "border-green-500/20 bg-green-500/10 text-green-700 hover:bg-green-500/20",
  [SubmissionStatus.RESUBMITTED]:
    "border-purple-500/20 bg-purple-500/10 text-purple-700 hover:bg-purple-500/20",
};

export default function SubmissionCard({
  submission,
}: {
  submission: StudentSubmission;
}) {
  const courseName = `${submission.assignment.course.academicLevel.name} - ${submission.assignment.course.subject.name}`;
  const teacherName =
    submission.assignment.course.teachers[0]?.displayName || "N/A";

  // This link is now conditional based on the submission's status
  const linkHref =
    submission.status === SubmissionStatus.GRADED
      ? `/grade/submission/${submission.id}/student-view`
      : `/courses/${submission.assignment.courseId}/assignments/${submission.assignment.id}/student-view`;

  const getButtonText = () => {
    if (submission.status === SubmissionStatus.PENDING)
      return "Start Assignment";
    if (submission.status === SubmissionStatus.SUBMITTED)
      return "View Submission";
    if (submission.status === SubmissionStatus.GRADED) return "View Grade";
    return "View";
  };

  return (
    <Card className="hover:border-primary/50 transition-colors">
      <Link href={linkHref} className="block">
        <CardHeader>
          <div className="flex justify-between items-start gap-4">
            <div>
              <Badge
                variant="outline"
                className={cn(statusStyles[submission.status])}
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
          </div>
        </CardHeader>
        <CardFooter className="flex justify-between items-center">
          <p className="text-xs text-muted-foreground">
            Due:{" "}
            {submission.assignment.dueDate
              ? new Date(submission.assignment.dueDate).toLocaleDateString()
              : "No due date"}
          </p>
          <div className="flex items-center text-primary text-sm font-semibold">
            {getButtonText()}
            <ArrowRight className="ml-2 h-4 w-4" />
          </div>
        </CardFooter>
      </Link>
    </Card>
  );
}
