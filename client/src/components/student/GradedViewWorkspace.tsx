//src/components/student/GradedViewWorkspace.tsx

"use client";

import dynamic from "next/dynamic";
import { useGetGradedSubmissionQuery } from "@/lib/submission/submissionApiSlice";
import { Loader2, AlertTriangle, Award, MessageSquare } from "lucide-react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

const DocumentViewer = dynamic(
  () => import("@/components/documents/view/DocumentViewer"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    ),
  }
);

export default function GradedViewWorkspace({
  submissionId,
}: {
  submissionId: string;
}) {
  const {
    data: submission,
    isLoading,
    isError,
  } = useGetGradedSubmissionQuery(submissionId);

  if (isLoading) {
    return (
      <div className="flex justify-center pt-10">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  if (isError || !submission) {
    return (
      <div className="text-center text-destructive">
        <AlertTriangle className="mx-auto h-8 w-8" />
        Submission not found.
      </div>
    );
  }

  const { assignment, document: studentDocument, correction } = submission;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <header className="flex justify-between items-center pb-4 border-b">
        <div>
          <h1 className="text-2xl font-bold">{assignment.title}</h1>
          <p className="text-sm text-muted-foreground">
            Review your graded work and the teacher's feedback.
          </p>
        </div>
      </header>

      <ResizablePanelGroup
        direction="horizontal"
        className="flex-1 rounded-lg border mt-4"
      >
        <ResizablePanel defaultSize={50}>
          <div className="flex flex-col h-full">
            <h3 className="p-2 text-sm font-semibold text-center bg-muted border-b">
              Your Submitted Work
            </h3>
            <div className="flex-1 overflow-hidden">
              <DocumentViewer
                // --- THIS IS THE FIX ---
                documentUrl={studentDocument?.originalFileUrl ?? null}
                editableContent={studentDocument?.editableContent ?? null}
              />
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={50}>
              <div className="flex flex-col h-full">
                <h3 className="p-2 text-sm font-semibold text-center bg-primary/10 border-b">
                  Teacher's Marked-up Copy
                </h3>
                <div className="flex-1 overflow-hidden">
                  <DocumentViewer
                    // --- THIS IS THE FIX ---
                    documentUrl={correction?.document?.originalFileUrl ?? null}
                    editableContent={
                      correction?.document?.editableContent ?? null
                    }
                  />
                </div>
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50}>
              <div className="flex flex-col h-full">
                <h3 className="p-2 text-sm font-semibold text-center bg-primary/10 border-b">
                  Final Grade & Comments
                </h3>
                <div className="p-4 space-y-4">
                  <div className="flex items-center gap-3">
                    <Award className="h-6 w-6 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Final Grade
                      </p>
                      <p className="text-2xl font-bold">
                        {correction?.grade || "Not Graded"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MessageSquare className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Overall Comments
                      </p>
                      <div className="text-sm prose dark:prose-invert mt-1">
                        {correction?.comments || "No comments provided."}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
