"use client";

import dynamic from "next/dynamic";
import { useGetAssignmentForStudentQuery } from "@/lib/assignment/assignmentApiSlice";
import { useGetSubmissionsForStudentQuery } from "@/lib/submission/submissionApiSlice";
import { Loader2, Clock, Info } from "lucide-react";
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/layouts/PageHeader";
import { Button } from "@/components/ui/button";
// --- THIS IS THE FIX ---
// Add 'CardDescription' to this import line
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SubmissionStatus } from "@/lib/submission/submissionTypes";
import Link from "next/link";

const DocumentViewer = dynamic(
  () => import("@/components/documents/view/DocumentViewer"),
  { ssr: false, loading: () => <p>Loading Viewer...</p> }
);

interface StudentAssignmentViewProps {
  assignmentId: string;
}

export default function StudentAssignmentView({
  assignmentId,
}: StudentAssignmentViewProps) {
  const {
    data: assignment,
    isLoading: isLoadingAssignment,
    isError: isErrorAssignment,
  } = useGetAssignmentForStudentQuery(assignmentId);

  const { data: submissions } = useGetSubmissionsForStudentQuery({});

  const thisSubmission = submissions?.find(
    (s) => s.assignment.id === assignmentId
  );

  if (isLoadingAssignment) {
    return (
      <div className="flex justify-center pt-10">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isErrorAssignment || !assignment) {
    return (
      <p className="text-destructive">
        Could not load assignment. You may not have access.
      </p>
    );
  }

  const getStatusMessage = () => {
    if (!thisSubmission || thisSubmission.status === SubmissionStatus.PENDING) {
      return "You have not submitted this assignment yet.";
    }
    if (thisSubmission.status === SubmissionStatus.SUBMITTED) {
      return `Submitted on ${new Date(
        thisSubmission.submittedAt
      ).toLocaleDateString()}`;
    }
    if (thisSubmission.status === SubmissionStatus.GRADED) {
      return `Graded on ${new Date(
        thisSubmission.correction!.correctedAt
      ).toLocaleDateString()}`;
    }
    return "";
  };

  return (
    <div className="flex flex-col h-full">
      <PageHeader>
        <div className="flex flex-col gap-2">
          <PageHeaderHeading>{assignment.title}</PageHeaderHeading>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              Due:{" "}
              {assignment.dueDate
                ? new Date(assignment.dueDate).toLocaleString()
                : "No due date"}
            </span>
          </div>
          {assignment.instructions && (
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>
                  <Info className="mr-2 h-4 w-4" />
                  View Instructions
                </AccordionTrigger>
                <AccordionContent>
                  <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                    {assignment.instructions}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </div>
      </PageHeader>

      <div className="grid gap-8 md:grid-cols-3 mt-4">
        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Assignment Worksheet</CardTitle>
            </CardHeader>
            <CardContent className="h-[60vh]">
              <DocumentViewer
                documentUrl={assignment.document.originalFileUrl}
                editableContent={assignment.document.editableContent}
              />
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Your Submission</CardTitle>
              <CardDescription>{getStatusMessage()}</CardDescription>
            </CardHeader>
            <CardContent>
              {thisSubmission?.status === SubmissionStatus.GRADED ? (
                <div className="space-y-4">
                  <h4 className="font-semibold">
                    Grade: {thisSubmission.correction?.grade || "Not Graded"}
                  </h4>
                  <p className="text-sm prose dark:prose-invert">
                    {thisSubmission.correction?.comments}
                  </p>
                </div>
              ) : (
                <Button size="lg" className="w-full" asChild>
                  <Link href={`/assignments/submit/${thisSubmission?.id}`}>
                    {thisSubmission?.status === SubmissionStatus.PENDING
                      ? "Start Assignment"
                      : "View / Edit Submission"}
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
