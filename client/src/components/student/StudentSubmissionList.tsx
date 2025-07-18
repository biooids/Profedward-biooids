"use client";

import { useGetSubmissionsForStudentQuery } from "@/lib/submission/submissionApiSlice";
import { SubmissionStatus } from "@/lib/submission/submissionTypes";
import { Loader2 } from "lucide-react";
import SubmissionCard from "./SubmissionCard";

export default function StudentSubmissionList({
  status,
}: {
  status: SubmissionStatus;
}) {
  const { data: submissions, isLoading } = useGetSubmissionsForStudentQuery({
    status,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center pt-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!submissions || submissions.length === 0) {
    return (
      <p className="text-sm text-center py-10 text-muted-foreground">
        No assignments found in this category.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {submissions.map((submission) => (
        <SubmissionCard key={submission.id} submission={submission} />
      ))}
    </div>
  );
}
