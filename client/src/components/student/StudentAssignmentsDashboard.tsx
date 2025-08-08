//src/components/student/StudentAssignmentsDashboard.tsx

"use client";

import { useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StudentSubmissionList from "./StudentSubmissionList";
import { SubmissionStatus } from "@/lib/submission/submissionTypes";
import { useGetSubmissionsForStudentQuery } from "@/lib/submission/submissionApiSlice";
import { Loader2 } from "lucide-react";
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/layouts/PageHeader";

export default function StudentAssignmentsDashboard({
  courseId,
}: {
  courseId: string;
}) {
  // Fetch submissions ONLY for this specific course
  const {
    data: allSubmissions = [],
    isLoading,
    isError,
  } = useGetSubmissionsForStudentQuery({
    courseId,
  });

  // Filter the single list into categories
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

  if (isError) {
    return (
      <p className="text-destructive">
        Failed to load your assignments for this course.
      </p>
    );
  }

  return (
    <>
      <PageHeader>
        <PageHeaderHeading>Assignments</PageHeaderHeading>
        <PageHeaderDescription>
          Track your assignments for this course.
        </PageHeaderDescription>
      </PageHeader>
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
    </>
  );
}
