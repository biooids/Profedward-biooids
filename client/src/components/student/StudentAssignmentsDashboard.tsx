//src/components/student/StudentAssignmentsDashboard.tsx
"use client";

import { useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StudentSubmissionList from "./StudentSubmissionList";
import { SubmissionStatus } from "@/lib/submission/submissionTypes";
import { useGetSubmissionsForStudentQuery } from "@/lib/submission/submissionApiSlice";
import { Loader2 } from "lucide-react";

export default function StudentAssignmentsDashboard() {
  // 1. Fetch ALL submissions for the student just once.
  const { data: allSubmissions = [], isLoading } =
    useGetSubmissionsForStudentQuery({});

  // 2. Filter the single list into categories using useMemo for efficiency.
  const pendingSubmissions = useMemo(
    () => allSubmissions.filter((s) => s.status === SubmissionStatus.PENDING),
    [allSubmissions]
  );
  const submittedSubmissions = useMemo(
    () => allSubmissions.filter((s) => s.status === SubmissionStatus.SUBMITTED),
    [allSubmissions]
  );
  const gradedSubmissions = useMemo(
    () => allSubmissions.filter((s) => s.status === SubmissionStatus.GRADED),
    [allSubmissions]
  );

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
          Pending ({pendingSubmissions.length})
        </TabsTrigger>
        <TabsTrigger value="submitted">
          Submitted ({submittedSubmissions.length})
        </TabsTrigger>
        <TabsTrigger value="graded">
          Graded ({gradedSubmissions.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="pending" className="mt-4">
        <StudentSubmissionList submissions={pendingSubmissions} />
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
