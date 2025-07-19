"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StudentSubmissionList from "./StudentSubmissionList";
import { SubmissionStatus } from "@/lib/submission/submissionTypes";
import PendingAssignmentsList from "./PendingAssignmentsList";

export default function StudentAssignmentsDashboard() {
  return (
    <Tabs defaultValue="pending" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="pending">Pending</TabsTrigger>
        <TabsTrigger value="submitted">Submitted</TabsTrigger>
        <TabsTrigger value="graded">Graded</TabsTrigger>
      </TabsList>

      <TabsContent value="pending" className="mt-4">
        <PendingAssignmentsList />
      </TabsContent>

      <TabsContent value="submitted" className="mt-4">
        <StudentSubmissionList status={SubmissionStatus.SUBMITTED} />
      </TabsContent>

      <TabsContent value="graded" className="mt-4">
        <StudentSubmissionList status={SubmissionStatus.GRADED} />
      </TabsContent>
    </Tabs>
  );
}
