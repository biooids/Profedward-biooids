"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useGetAssignmentForStudentQuery } from "@/lib/assignment/assignmentApiSlice";
import {
  useFindOrCreateSubmissionQuery,
  useSaveDraftMutation,
  useSubmitWorkMutation,
} from "@/lib/submission/submissionApiSlice";
import {
  useCreateEditableDocumentMutation,
  useUpdateDocumentMutation,
} from "@/lib/document/documentApiSlice";
import { Loader2, Save, Send, Clock, Info, Edit, FileScan } from "lucide-react";
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/layouts/PageHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Document } from "@/lib/document/documentTypes";
import { SubmissionStatus } from "@/lib/submission/submissionTypes";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const DocumentViewer = dynamic(
  () => import("@/components/documents/view/DocumentViewer"),
  { ssr: false, loading: () => <p>Loading Viewer...</p> }
);

export default function StudentAssignmentView({
  assignmentId,
}: {
  assignmentId: string;
}) {
  const router = useRouter();

  const {
    data: submission,
    isLoading: isLoadingSubmission,
    isError,
  } = useFindOrCreateSubmissionQuery(assignmentId);

  const [createEditableDoc, { isLoading: isCreatingCopy }] =
    useCreateEditableDocumentMutation();
  const [updateDocument] = useUpdateDocumentMutation();
  const [saveDraft, { isLoading: isSavingDraft }] = useSaveDraftMutation();
  const [submitWork, { isLoading: isSubmitting }] = useSubmitWorkMutation();

  const [studentDoc, setStudentDoc] = useState<Document | null>(null);
  const [isConfirmingSubmit, setIsConfirmingSubmit] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (submission) {
      if (submission.document) {
        setStudentDoc(submission.document);
      } else if (submission.assignment.document && !studentDoc) {
        const createCopy = async () => {
          try {
            toast.info("Preparing your personal worksheet...");
            const newDocResult = await createEditableDoc({
              name: `Submission for: ${submission.assignment.title}`,
              content: submission.assignment.document.editableContent,
            }).unwrap();

            await saveDraft({
              submissionId: submission.id,
              data: { documentId: newDocResult.data.document.id },
            }).unwrap();

            setStudentDoc(newDocResult.data.document);
            toast.success("Your worksheet is ready.");
          } catch (err) {
            toast.error("Failed to create a copy of the assignment worksheet.");
          }
        };
        createCopy();
      }
    }
  }, [submission, createEditableDoc, saveDraft, studentDoc]);

  const handleSaveDraft = async () => {
    if (!studentDoc || !submission) return;

    try {
      await updateDocument({
        documentId: studentDoc.id,
        data: {
          name: studentDoc.name,
          content: studentDoc.editableContent,
        },
      }).unwrap();

      await saveDraft({
        submissionId: submission.id,
        data: { documentId: studentDoc.id },
      }).unwrap();

      toast.success("Your draft has been saved!");
      setIsDirty(false);
    } catch (err: any) {
      console.error("Error saving draft:", err);
      toast.error(err.data?.message || "Failed to save draft.");
    }
  };

  const handleFinalSubmit = async () => {
    if (!studentDoc || !submission) return;
    setIsConfirmingSubmit(false);

    const promise = submitWork({
      submissionId: submission.id,
      data: { documentId: studentDoc.id },
    }).unwrap();

    toast.promise(promise, {
      loading: "Submitting assignment...",
      success: () => {
        router.push(
          `/courses/${submission?.assignment?.courseId}/student-view`
        );
        return "Assignment submitted successfully!";
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
      <p className="text-destructive">
        Could not load assignment. You may not have access.
      </p>
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

      <div className="flex flex-col h-full">
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
            <Accordion type="single" collapsible className="w-full mt-4">
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

        <Tabs
          defaultValue="your-worksheet"
          className="flex-1 flex flex-col mt-4"
        >
          <TabsList>
            <TabsTrigger value="your-worksheet">
              <Edit className="mr-2 h-4 w-4" /> Your Worksheet
            </TabsTrigger>
            <TabsTrigger value="teacher-worksheet">
              <FileScan className="mr-2 h-4 w-4" /> Teacher's Worksheet
            </TabsTrigger>
            {teacherDocument.originalFileUrl && (
              <TabsTrigger value="original-scan">
                <FileScan className="mr-2 h-4 w-4" /> Original Scan
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent
            value="your-worksheet"
            className="flex-1 mt-2 border rounded-lg overflow-hidden"
          >
            {studentDoc ? (
              <TiptapEditor
                key={studentDoc.id}
                initialContent={studentDoc.editableContent}
                onUpdate={(content) => {
                  setStudentDoc({
                    ...studentDoc,
                    editableContent: JSON.parse(content),
                  });
                  setIsDirty(true);
                }}
                editable={!isSubmittedOrGraded}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin" />
                <p className="ml-4">Preparing your personal worksheet...</p>
              </div>
            )}
          </TabsContent>

          <TabsContent
            value="teacher-worksheet"
            className="flex-1 mt-2 border rounded-lg overflow-hidden"
          >
            <DocumentViewer
              documentUrl={null}
              editableContent={teacherDocument.editableContent}
            />
          </TabsContent>

          {teacherDocument.originalFileUrl && (
            <TabsContent
              value="original-scan"
              className="flex-1 mt-2 border rounded-lg overflow-hidden"
            >
              <DocumentViewer
                documentUrl={teacherDocument.originalFileUrl}
                editableContent={null}
              />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </>
  );
}
