//src/components/teacher/AssignmentsDashboard.tsx

"use client";

import { useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TeacherSubmissionList from "./SubmissionList";
import { SubmissionStatus } from "@/lib/submission/submissionTypes";
import { useGetTeacherSubmissionsQuery } from "@/lib/submission/submissionApiSlice";
import { Loader2 } from "lucide-react";
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/layouts/PageHeader";

export default function AssignmentsDashboard({
  courseId,
}: {
  courseId: string;
}) {
  // Fetch submissions ONLY for this specific course
  const {
    data: allSubmissions = [],
    isLoading,
    isError,
  } = useGetTeacherSubmissionsQuery({
    courseId,
  });

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

  if (isError) {
    return (
      <p className="text-destructive">
        Failed to load submissions for this course.
      </p>
    );
  }

  return (
    <>
      <PageHeader>
        <PageHeaderHeading>Submissions</PageHeaderHeading>
        <PageHeaderDescription>
          Review student submissions for this course.
        </PageHeaderDescription>
      </PageHeader>
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
    </>
  );
}
