"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useGetSubmissionsForStudentQuery,
  useSubmitWorkMutation,
} from "@/lib/submission/submissionApiSlice";
import AssignmentDocumentManager from "@/components/teacher/forms/AssignmentDocumentManager"; // Re-using this component
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function StudentSubmissionWorkspace({
  submissionId,
}: {
  submissionId: string;
}) {
  const router = useRouter();
  // --- THIS IS THE FIX ---
  const {
    data: submission,
    isLoading,
    isError,
  } = useGetSubmissionsForStudentQuery(
    { status: undefined },
    {
      // The 'result' object contains the original isLoading, isError, etc.
      selectFromResult: (result) => ({
        // Find the specific submission from the cached list
        data: result.data?.find((s) => s.id === submissionId),

        // Pass through the other properties you need
        isLoading: result.isLoading,
        isError: result.isError,
      }),
    }
  );

  const [submitWork, { isLoading: isSubmitting }] = useSubmitWorkMutation();
  const [studentDocumentId, setStudentDocumentId] = useState<string | null>(
    null
  );

  const handleDocumentCreated = (docId: string) => {
    setStudentDocumentId(docId);
  };

  const handleSubmitWork = async () => {
    if (!studentDocumentId || !submission) return;
    try {
      await submitWork({
        submissionId: submission.id,
        data: { documentId: studentDocumentId },
      }).unwrap();
      router.push("/assignments"); // Go back to the dashboard on success
    } catch (err) {
      console.error("Failed to submit work:", err);
    }
  };

  if (isLoading) return <Loader2 className="h-8 w-8 animate-spin" />;
  if (!submission) return <p>Submission not found.</p>;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">{submission.assignment.title}</h1>
        <p className="text-muted-foreground">
          Submit your work for this assignment.
        </p>
        {/* Here you would display assignment instructions and link to the original document */}
      </header>

      <main>
        <AssignmentDocumentManager
          onDocumentCreated={handleDocumentCreated}
          initialDocumentName={`Submission for ${submission.assignment.title}`}
        />
      </main>

      <footer className="flex justify-end">
        <Button
          onClick={handleSubmitWork}
          disabled={!studentDocumentId || isSubmitting}
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Submit My Work
        </Button>
      </footer>
    </div>
  );
}
