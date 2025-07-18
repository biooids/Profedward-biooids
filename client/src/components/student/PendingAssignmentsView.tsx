"use client";

import { useGetPendingAssignmentsByCourseQuery } from "@/lib/submission/submissionApiSlice";
import { Loader2 } from "lucide-react";
import PendingAssignmentCourseCard from "./PendingAssignmentCourseCard";

export default function PendingAssignmentsView() {
  const { data: coursesWithPending, isLoading } =
    useGetPendingAssignmentsByCourseQuery();

  if (isLoading) {
    return (
      <div className="flex justify-center pt-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!coursesWithPending || coursesWithPending.length === 0) {
    return (
      <p className="text-sm text-center py-10 text-muted-foreground">
        You have no pending assignments. Great job!
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {coursesWithPending.map((course) => (
        <PendingAssignmentCourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}
