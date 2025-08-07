//src/components/teacher/AssignmentsDashboard.tsx
"use client";

import { useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TeacherSubmissionList from "./SubmissionList";
import { SubmissionStatus } from "@/lib/submission/submissionTypes";
import { useGetTeacherSubmissionsQuery } from "@/lib/submission/submissionApiSlice";
import { Loader2 } from "lucide-react";

export default function AssignmentsDashboard() {
  // 1. Fetch ALL submissions for the teacher just once.
  const { data: allSubmissions = [], isLoading } =
    useGetTeacherSubmissionsQuery({});

  // 2. Filter the single list into categories using useMemo for efficiency.
  const readyToGrade = useMemo(
    () => allSubmissions.filter((s) => s.status === SubmissionStatus.SUBMITTED),
    [allSubmissions]
  );
  const graded = useMemo(
    () => allSubmissions.filter((s) => s.status === SubmissionStatus.GRADED),
    [allSubmissions]
  );
  const notSubmitted = useMemo(
    () => allSubmissions.filter((s) => s.status === SubmissionStatus.PENDING),
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
    <Tabs defaultValue="ready_to_grade">
      <TabsList>
        <TabsTrigger value="ready_to_grade">
          Ready to Grade ({readyToGrade.length})
        </TabsTrigger>
        <TabsTrigger value="graded">Graded ({graded.length})</TabsTrigger>
        <TabsTrigger value="not_submitted">
          Not Submitted ({notSubmitted.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="ready_to_grade" className="mt-4">
        <TeacherSubmissionList submissions={readyToGrade} />
      </TabsContent>

      <TabsContent value="graded" className="mt-4">
        <TeacherSubmissionList submissions={graded} />
      </TabsContent>

      <TabsContent value="not_submitted" className="mt-4">
        <TeacherSubmissionList submissions={notSubmitted} />
      </TabsContent>
    </Tabs>
  );
}
