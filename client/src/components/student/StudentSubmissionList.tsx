//src/components/student/StudentSubmissionList.tsx
"use client";

import SubmissionCard from "./SubmissionCard";
import { StudentSubmission } from "@/lib/submission/submissionTypes";

export default function StudentSubmissionList({
  submissions,
}: {
  submissions: StudentSubmission[];
}) {
  if (!submissions || submissions.length === 0) {
    return (
      <p className="text-sm text-center py-10 text-muted-foreground">
        No submissions found in this category.
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
