//src/components/teacher/AssignmentsDashboard.tsx
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SubmissionList from "./SubmissionList";
import { SubmissionStatus } from "@/lib/submission/submissionTypes";

export default function AssignmentsDashboard() {
  return (
    <Tabs defaultValue="ready_to_grade">
      <TabsList>
        <TabsTrigger value="ready_to_grade">Ready to Grade</TabsTrigger>
        <TabsTrigger value="graded">Graded</TabsTrigger>
        <TabsTrigger value="not_submitted">Not Submitted</TabsTrigger>
      </TabsList>

      <TabsContent value="ready_to_grade" className="mt-4">
        <SubmissionList status={SubmissionStatus.SUBMITTED} />
      </TabsContent>

      <TabsContent value="graded" className="mt-4">
        <SubmissionList status={SubmissionStatus.GRADED} />
      </TabsContent>

      <TabsContent value="not_submitted" className="mt-4">
        <SubmissionList status={SubmissionStatus.PENDING} />
      </TabsContent>
    </Tabs>
  );
}
