//src/components/student/StudentAssignmentsDashboard.tsx

"use client";

import { useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StudentSubmissionList from "./StudentSubmissionList";
import PendingAssignmentCard from "./PendingAssignmentCard"; // Import the new card
import { SubmissionStatus } from "@/lib/submission/submissionTypes";
import { useGetSubmissionsForStudentQuery } from "@/lib/submission/submissionApiSlice";
import { useGetPendingAssignmentsQuery } from "@/lib/assignment/assignmentApiSlice"; // Import the pending query
import { Loader2 } from "lucide-react";

export default function StudentAssignmentsDashboard() {
  // 1. Fetch the list of PENDING assignments
  const { data: pendingAssignments = [], isLoading: isLoadingPending } =
    useGetPendingAssignmentsQuery();

  // 2. Fetch the list of SUBMITTED and GRADED submissions
  const { data: allSubmissions = [], isLoading: isLoadingSubmissions } =
    useGetSubmissionsForStudentQuery({});

  const submittedSubmissions = useMemo(
    () => allSubmissions.filter((s) => s.status === SubmissionStatus.SUBMITTED),
    [allSubmissions]
  );
  const gradedSubmissions = useMemo(
    () => allSubmissions.filter((s) => s.status === SubmissionStatus.GRADED),
    [allSubmissions]
  );

  const isLoading = isLoadingPending || isLoadingSubmissions;

  if (isLoading) {
    return (
      <div className="flex justify-center pt-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <Tabs defaultValue="pending" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="pending">
          Pending ({pendingAssignments.length})
        </TabsTrigger>
        <TabsTrigger value="submitted">
          Submitted ({submittedSubmissions.length})
        </TabsTrigger>
        <TabsTrigger value="graded">
          Graded ({gradedSubmissions.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="pending" className="mt-4">
        {/* 3. Render the dedicated pending list and card */}
        {pendingAssignments.length > 0 ? (
          <div className="space-y-4">
            {pendingAssignments.map((assignment) => (
              <PendingAssignmentCard
                key={assignment.id}
                assignment={assignment}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-center py-10 text-muted-foreground">
            You have no pending assignments. Great job!
          </p>
        )}
      </TabsContent>

      <TabsContent value="submitted" className="mt-4">
        <StudentSubmissionList submissions={submittedSubmissions} />
      </TabsContent>

      <TabsContent value="graded" className="mt-4">
        <StudentSubmissionList submissions={gradedSubmissions} />
      </TabsContent>
    </Tabs>
  );
}
