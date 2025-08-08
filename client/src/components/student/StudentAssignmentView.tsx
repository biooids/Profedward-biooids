//src/components/student/StudentAssignmentView.tsx

"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  useFindOrCreateSubmissionQuery,
  useSaveDraftMutation,
  useSubmitWorkMutation,
} from "@/lib/submission/submissionApiSlice";
import {
  useCreateEditableDocumentMutation,
  useUpdateDocumentMutation,
} from "@/lib/document/documentApiSlice";
import { Loader2, Save, Send, Clock, Info, AlertTriangle } from "lucide-react";
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/layouts/PageHeader";
import { Button } from "@/components/ui/button";
import TiptapEditor from "@/components/editor/TiptapEditor";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Document as DocumentType } from "@/lib/document/documentTypes";
import { SubmissionStatus } from "@/lib/submission/submissionTypes";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useSession } from "next-auth/react";

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

export default function StudentAssignmentView({
  assignmentId,
}: {
  assignmentId: string;
}) {
  const router = useRouter();
  const { status: authStatus } = useSession();

  const {
    data: submission,
    isLoading: isLoadingSubmission,
    isError,
  } = useFindOrCreateSubmissionQuery(assignmentId, {
    skip: authStatus !== "authenticated",
  });

  const [createEditableDoc, { isLoading: isCreatingCopy }] =
    useCreateEditableDocumentMutation();
  const [updateDocument] = useUpdateDocumentMutation();
  const [saveDraft, { isLoading: isSavingDraft }] = useSaveDraftMutation();
  const [submitWork, { isLoading: isSubmitting }] = useSubmitWorkMutation();

  const [studentDoc, setStudentDoc] = useState<DocumentType | null>(null);
  const [isConfirmingSubmit, setIsConfirmingSubmit] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const editorContentRef = useRef<any>(null);

  useEffect(() => {
    if (submission) {
      // --- LOGGING FETCHED DATA ---
      console.log("✅ FETCHED DATA: Full submission object:", submission);

      if (submission.document && !studentDoc) {
        console.log(
          "Found existing document on submission, setting it in state."
        );
        setStudentDoc(submission.document);
        editorContentRef.current = submission.document.editableContent;
      } else if (submission.assignment.document && !studentDoc) {
        const createCopy = async () => {
          try {
            toast.info("Preparing your personal worksheet...");
            console.log("No student doc found, creating a new copy.");
            const newDocResult = await createEditableDoc({
              name: `Submission for: ${submission.assignment.title}`,
              content: submission.assignment.document.editableContent,
            }).unwrap();

            const finalDoc = newDocResult.data.document;

            await saveDraft({
              submissionId: submission.id,
              data: { documentId: finalDoc.id },
            }).unwrap();

            setStudentDoc(finalDoc);
            editorContentRef.current = finalDoc.editableContent;
            toast.success("Your worksheet is ready.");
          } catch (err) {
            toast.error("Failed to create a copy of the assignment worksheet.");
          }
        };
        createCopy();
      }
    }
  }, [submission, createEditableDoc, saveDraft, studentDoc]); // Added studentDoc to dependency array

  const handleSaveDraft = async () => {
    // --- LOGGING DATA ON SAVE ---
    console.log("💾 SAVE DRAFT TRIGGERED");
    console.log("Content to be saved (from ref):", editorContentRef.current);
    console.log("Current submission data:", submission);

    if (!studentDoc || !submission) {
      console.error(
        "❌ Cannot save draft: Missing student document or submission data."
      );
      return;
    }

    const promise = new Promise(async (resolve, reject) => {
      try {
        const payload = {
          documentId: studentDoc.id,
          data: {
            name: studentDoc.name,
            content: editorContentRef.current,
          },
        };
        console.log("API PAYLOAD for updateDocument:", payload);

        // Step 1: Save the actual content changes to the document
        await updateDocument(payload).unwrap();

        // Step 2: Update the submission status (this might just update a timestamp)
        await saveDraft({
          submissionId: submission.id,
          data: { documentId: studentDoc.id },
        }).unwrap();

        resolve("Draft saved successfully!");
      } catch (err) {
        console.error("❌ Error during save draft process:", err);
        reject(err);
      }
    });

    toast.promise(promise, {
      loading: "Saving your draft...",
      success: (message) => {
        setIsDirty(false); // Reset the dirty flag only on success
        return message as string;
      },
      error: "Failed to save your draft. Please try again.",
    });
  };

  const handleFinalSubmit = async () => {
    if (!studentDoc || !submission) return;
    setIsConfirmingSubmit(false);

    const promise = new Promise(async (resolve, reject) => {
      try {
        if (isDirty) {
          const payload = {
            documentId: studentDoc.id,
            data: { content: editorContentRef.current },
          };
          console.log(
            "SUBMIT: Document is dirty. Saving this payload before submitting:",
            payload
          );
          await updateDocument(payload).unwrap();
        }

        await submitWork({
          submissionId: submission.id,
          data: { documentId: studentDoc.id },
        }).unwrap();

        resolve("Assignment submitted successfully!");
      } catch (err) {
        reject(err);
      }
    });

    toast.promise(promise, {
      loading: "Submitting assignment...",
      success: (message) => {
        router.push(`/assignments/${submission?.assignment?.courseId}`);
        return message as string;
      },
      error: "Failed to submit assignment.",
    });
  };

  const isLoading = isLoadingSubmission || isCreatingCopy;

  if (isLoading) {
    return (
      <div className="flex justify-center pt-10">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isError || !submission) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-destructive">
        <AlertTriangle className="h-10 w-10 mb-4" />
        <h2 className="text-xl font-semibold">Could Not Load Assignment</h2>
        <p className="text-sm">
          You may not have access to this assignment or an error occurred.
        </p>
      </div>
    );
  }

  const { assignment } = submission;
  const teacherDocument = assignment.document;
  const isSubmittedOrGraded =
    submission.status === SubmissionStatus.SUBMITTED ||
    submission.status === SubmissionStatus.GRADED;

  return (
    <>
      <AlertDialog
        open={isConfirmingSubmit}
        onOpenChange={setIsConfirmingSubmit}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Your Assignment?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            Once you submit, you will not be able to make changes. Are you
            ready?
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleFinalSubmit}>
              Yes, Submit Now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <PageHeader>
          <div className="flex justify-between items-start">
            <div>
              <PageHeaderHeading>{assignment.title}</PageHeaderHeading>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                <Clock className="h-4 w-4" />
                <span>
                  Due:{" "}
                  {assignment.dueDate
                    ? new Date(assignment.dueDate).toLocaleString()
                    : "No due date"}
                </span>
              </div>
            </div>
            {!isSubmittedOrGraded && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleSaveDraft}
                  disabled={isSavingDraft || !isDirty}
                >
                  {isSavingDraft ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save Draft
                </Button>
                <Button
                  size="lg"
                  onClick={() => setIsConfirmingSubmit(true)}
                  disabled={isSubmitting}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Submit Assignment
                </Button>
              </div>
            )}
          </div>
          {assignment.instructions && (
            <Accordion type="single" collapsible className="w-full mt-2">
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
        </PageHeader>

        <ResizablePanelGroup
          direction="vertical"
          className="flex-1 rounded-lg border mt-4"
        >
          <ResizablePanel defaultSize={50}>
            <ResizablePanelGroup direction="horizontal">
              <ResizablePanel defaultSize={50}>
                <div className="flex flex-col h-full">
                  <h3 className="p-2 text-sm font-semibold text-center bg-muted border-b">
                    Teacher's Worksheet (Parsed)
                  </h3>
                  <div className="flex-1 overflow-y-auto">
                    <TiptapEditor
                      initialContent={teacherDocument.editableContent}
                      editable={false}
                    />
                  </div>
                </div>
              </ResizablePanel>
              {teacherDocument.originalFileUrl && (
                <>
                  <ResizableHandle withHandle />
                  <ResizablePanel defaultSize={50}>
                    <div className="flex flex-col h-full">
                      <h3 className="p-2 text-sm font-semibold text-center bg-muted border-b">
                        Original Scan (PDF)
                      </h3>
                      <div className="flex-1 overflow-hidden">
                        <DocumentViewer
                          documentUrl={teacherDocument.originalFileUrl}
                          editableContent={null}
                        />
                      </div>
                    </div>
                  </ResizablePanel>
                </>
              )}
            </ResizablePanelGroup>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={50}>
            <div className="flex flex-col h-full">
              <h3 className="p-2 text-sm font-semibold text-center bg-primary/10 border-t">
                Your Work
              </h3>
              <div className="flex-1 overflow-y-auto">
                {studentDoc ? (
                  <TiptapEditor
                    key={studentDoc.id}
                    initialContent={studentDoc.editableContent}
                    onUpdate={(content) => {
                      editorContentRef.current = JSON.parse(content);
                      setIsDirty(true);
                      // Note: We don't need to call setStudentDoc here on every keystroke,
                      // as it can cause performance issues. The ref is sufficient for saving.
                    }}
                    editable={!isSubmittedOrGraded}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <p className="ml-4">Preparing your worksheet...</p>
                  </div>
                )}
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </>
  );
}
