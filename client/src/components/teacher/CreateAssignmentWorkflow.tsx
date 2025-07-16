"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateAssignmentMutation } from "@/lib/assignment/assignmentApiSlice";
import AssignmentDetailsForm from "./forms/AssignmentDetailsForm";
import AssignmentDocumentManager from "./forms/AssignmentDocumentManager";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { AssignmentDetailsFormValues } from "@/lib/schemas/assignment.schemas";

interface CreateAssignmentWorkflowProps {
  courseId: string;
}

export default function CreateAssignmentWorkflow({
  courseId,
}: CreateAssignmentWorkflowProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [assignmentDetails, setAssignmentDetails] =
    useState<AssignmentDetailsFormValues | null>(null);
  const [documentInfo, setDocumentInfo] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const [createAssignment, { isLoading }] = useCreateAssignmentMutation();

  const handleDetailsSubmit = (data: AssignmentDetailsFormValues) => {
    setAssignmentDetails(data);
    setStep(2);
  };

  const handleDocumentCreated = (id: string, name: string) => {
    setDocumentInfo({ id, name });
  };

  const handleFinalPublish = async () => {
    if (!assignmentDetails || !documentInfo) return;

    try {
      await createAssignment({
        ...assignmentDetails,
        courseId,
        documentId: documentInfo.id,
        dueDate: assignmentDetails.dueDate?.toISOString(),
      }).unwrap();
      // On success, navigate back to the course detail page
      router.push(`/courses/${courseId}`);
    } catch (err) {
      console.error("Failed to publish assignment:", err);
    }
  };

  return (
    <div className="mt-4">
      {step === 1 && <AssignmentDetailsForm onNext={handleDetailsSubmit} />}
      {step === 2 && (
        <div className="space-y-8">
          <AssignmentDocumentManager
            onDocumentCreated={handleDocumentCreated}
            // Pass initial document name based on assignment title
            initialDocumentName={assignmentDetails?.title || "New Assignment"}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button
              onClick={handleFinalPublish}
              disabled={!documentInfo || isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Publish Assignment
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
