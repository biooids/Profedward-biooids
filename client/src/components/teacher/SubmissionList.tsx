//src/components/teacher/SubmissionList.tsx

"use client";

import TeacherSubmissionCard from "./TeacherSubmissionCard";
import { Submission } from "@/lib/submission/submissionTypes";

interface SubmissionListProps {
  submissions: Submission[];
}

export default function SubmissionList({ submissions }: SubmissionListProps) {
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
        <TeacherSubmissionCard key={submission.id} submission={submission} />
      ))}
    </div>
  );
}
