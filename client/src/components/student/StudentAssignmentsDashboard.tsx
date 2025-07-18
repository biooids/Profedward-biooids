"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StudentSubmissionList from "./StudentSubmissionList";
import { SubmissionStatus } from "@/lib/submission/submissionTypes";
import PendingAssignmentsView from "./PendingAssignmentsView";

export default function StudentAssignmentsDashboard() {
  return (
    <Tabs defaultValue="pending" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="pending">Pending</TabsTrigger>
        <TabsTrigger value="submitted">Submitted</TabsTrigger>
        <TabsTrigger value="graded">Graded</TabsTrigger>
      </TabsList>

      <TabsContent value="pending" className="mt-4">
        {/* This tab uses the course card layout we just built */}
        <PendingAssignmentsView />
      </TabsContent>

      <TabsContent value="submitted" className="mt-4">
        {/* This tab shows a simple list of submitted items */}
        <StudentSubmissionList status={SubmissionStatus.SUBMITTED} />
      </TabsContent>

      <TabsContent value="graded" className="mt-4">
        {/* This tab shows a simple list of graded items */}
        <StudentSubmissionList status={SubmissionStatus.GRADED} />
      </TabsContent>
    </Tabs>
  );
}
