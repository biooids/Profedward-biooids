//src/components/teacher/TeacherSubmissionCard.tsx

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
import { Submission, SubmissionStatus } from "@/lib/submission/submissionTypes";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const statusStyles: Record<SubmissionStatus, string> = {
  [SubmissionStatus.PENDING]: "border-gray-500/20 bg-gray-500/10 text-gray-500",
  [SubmissionStatus.SUBMITTED]:
    "border-blue-500/20 bg-blue-500/10 text-blue-700 hover:bg-blue-500/20",
  [SubmissionStatus.GRADED]:
    "border-green-500/20 bg-green-500/10 text-green-700 hover:bg-green-500/20",
  [SubmissionStatus.RESUBMITTED]:
    "border-purple-500/20 bg-purple-500/10 text-purple-700 hover:bg-purple-500/20",
};

export default function TeacherSubmissionCard({
  submission,
}: {
  submission: Submission;
}) {
  // --- THIS IS THE FIX ---
  // The link now correctly points to the dedicated grading page for this specific submission.
  const linkHref = `/grade/submission/${submission.id}`;

  const getButtonText = () => {
    if (submission.status === SubmissionStatus.SUBMITTED)
      return "Grade Submission";
    if (submission.status === SubmissionStatus.GRADED)
      return "View Graded Work";
    // This case won't be reached due to the conditional render below, but is good for completeness.
    return "View";
  };

  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={submission.student.profileImage ?? ""} />
              <AvatarFallback>
                {submission.student.displayName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">
                {submission.student.displayName}
              </CardTitle>
              <CardDescription className="text-xs">
                Submission for:{" "}
                <span className="font-semibold text-foreground">
                  {submission.assignment.title}
                </span>
              </CardDescription>
            </div>
          </div>
          <Badge
            variant="outline"
            className={cn(statusStyles[submission.status])}
          >
            {submission.status === SubmissionStatus.PENDING
              ? "Not Submitted"
              : submission.status}
          </Badge>
        </div>
      </CardHeader>
      <CardFooter className="flex justify-between items-center">
        <p className="text-xs text-muted-foreground">
          {submission.status !== SubmissionStatus.PENDING
            ? `Submitted: ${new Date(submission.submittedAt).toLocaleString()}`
            : `Assignment available, awaiting submission.`}
        </p>
        {/* The button and link will only render for SUBMITTED or GRADED items */}
        {submission.status !== SubmissionStatus.PENDING && (
          <Button variant="outline" size="sm" asChild>
            <Link href={linkHref}>
              {getButtonText()}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
