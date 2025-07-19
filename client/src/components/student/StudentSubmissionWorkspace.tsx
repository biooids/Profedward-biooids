"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  useGetSubmissionsForStudentQuery,
  useSubmitWorkMutation,
} from "@/lib/submission/submissionApiSlice";
import {
  useCreateEditableDocumentMutation,
  useUpdateDocumentMutation,
} from "@/lib/document/documentApiSlice";
import { Loader2, Save, Send, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import TiptapEditor from "@/components/editor/TiptapEditor";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Document as DocumentType } from "@/lib/document/documentTypes";

const DocumentViewer = dynamic(
  () => import("@/components/documents/view/DocumentViewer"),
  {
    ssr: false,
    loading: () => (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    ),
  }
);

export default function StudentSubmissionWorkspace({
  submissionId,
}: {
  submissionId: string;
}) {
  const router = useRouter();

  // --- FIX #1: Correctly pass through isLoading and isError ---
  const {
    data: submission,
    isLoading: isLoadingSubmission,
    isError,
  } = useGetSubmissionsForStudentQuery(
    {},
    {
      selectFromResult: (result) => ({
        data: result.data?.find((s) => s.id === submissionId),
        isLoading: result.isLoading,
        isError: result.isError,
      }),
    }
  );

  const [createDocument, { isLoading: isCreatingDoc }] =
    useCreateEditableDocumentMutation();
  const [updateDocument, { isLoading: isUpdatingDoc }] =
    useUpdateDocumentMutation();
  const [submitWork, { isLoading: isSubmitting }] = useSubmitWorkMutation();

  const [studentWorkDoc, setStudentWorkDoc] = useState<DocumentType | null>(
    null
  );
  const [editorContent, setEditorContent] = useState<any | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  const isLoading = isCreatingDoc || isUpdatingDoc;

  useEffect(() => {
    if (!studentWorkDoc?.editableContent || !editorContent) return;
    const originalContent = JSON.stringify(studentWorkDoc.editableContent);
    const currentContent = JSON.stringify(editorContent);
    setIsDirty(originalContent !== currentContent);
  }, [editorContent, studentWorkDoc]);

  const handleSaveDraft = async () => {
    if (!submission) return;
    try {
      if (studentWorkDoc) {
        // --- FIX #2: Extract the nested document from the response ---
        const response = await updateDocument({
          documentId: studentWorkDoc.id,
          data: { content: editorContent },
        }).unwrap();
        setStudentWorkDoc(response.data.document);
      } else {
        // --- FIX #2: Extract the nested document from the response ---
        const response = await createDocument({
          name: `Submission for: ${submission.assignment.title}`,
          content: editorContent,
        }).unwrap();
        setStudentWorkDoc(response.data.document);
      }
      setIsDirty(false);
    } catch (err) {
      console.error("Failed to save draft:", err);
    }
  };

  const handleSubmitWork = async () => {
    if (!studentWorkDoc || !submission) return;
    if (isDirty) {
      alert(
        "You have unsaved changes. Please save your draft before submitting."
      );
      return;
    }
    try {
      await submitWork({
        submissionId: submission.id,
        data: { documentId: studentWorkDoc.id },
      }).unwrap();
      router.push("/assignments");
    } catch (err) {
      console.error("Failed to submit work:", err);
    }
  };

  if (isLoadingSubmission)
    return (
      <div className="flex justify-center pt-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  if (isError || !submission)
    return (
      <div className="text-center text-destructive">
        <AlertTriangle className="mx-auto h-8 w-8 mb-2" />
        Submission not found.
      </div>
    );

  const teacherWorksheet = submission.assignment.document;

  return (
    <div className="flex flex-col h-[calc(100vh-100px)]">
      <header className="flex justify-between items-center p-4 border-b">
        <div>
          <h1 className="text-2xl font-bold">{submission.assignment.title}</h1>
          <p className="text-sm text-muted-foreground">
            Complete your work in the editor and submit.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            disabled={!isDirty || isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Draft
          </Button>
          <Button
            onClick={handleSubmitWork}
            disabled={!studentWorkDoc || isDirty || isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Submit Assignment
          </Button>
        </div>
      </header>

      <ResizablePanelGroup
        direction="horizontal"
        className="flex-1 rounded-lg border"
      >
        <ResizablePanel defaultSize={50}>
          <div className="flex flex-col h-full">
            <h3 className="p-2 text-sm font-semibold text-center bg-muted border-b">
              Teacher's Worksheet
            </h3>
            <div className="flex-1 overflow-hidden">
              <DocumentViewer
                documentUrl={teacherWorksheet.originalFileUrl}
                editableContent={teacherWorksheet.editableContent}
              />
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50}>
          <div className="flex flex-col h-full">
            <h3 className="p-2 text-sm font-semibold text-center bg-muted border-b">
              Your Work
            </h3>
            <div className="flex-1 overflow-y-auto">
              <TiptapEditor
                onUpdate={(c) => setEditorContent(JSON.parse(c))}
                editable={true}
              />
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
