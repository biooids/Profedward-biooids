"use client";

import { useGetTeacherSubmissionsQuery } from "@/lib/submission/submissionApiSlice";
import { SubmissionStatus } from "@/lib/submission/submissionTypes";
import { Loader2 } from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface SubmissionListProps {
  status: SubmissionStatus;
}

export default function SubmissionList({ status }: SubmissionListProps) {
  const { data: submissions, isLoading } = useGetTeacherSubmissionsQuery({
    status,
  });

  if (isLoading) {
    return <Loader2 className="h-6 w-6 animate-spin" />;
  }

  if (!submissions || submissions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No submissions found in this category.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {submissions.map((sub) => (
        <Card key={sub.id}>
          <CardHeader>
            <CardTitle>{sub.student.displayName}</CardTitle>
            <CardDescription>
              Assignment: {sub.assignment.title} • Submitted:{" "}
              {new Date(sub.submittedAt).toLocaleString()}
            </CardDescription>
          </CardHeader>
          {/* In a real app, clicking this card would go to the grading page */}
        </Card>
      ))}
    </div>
  );
}
