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

  const isSaving = isCreatingDoc || isUpdatingDoc;

  useEffect(() => {
    if (submission) {
      const isWorkStarted =
        submission.document.id !== submission.assignment.document.id;
      if (isWorkStarted) {
        setStudentWorkDoc(submission.document);
        setEditorContent(submission.document.editableContent);
      }
    }
  }, [submission]);

  useEffect(() => {
    if (editorContent === null && studentWorkDoc === null) return;
    const originalContent = studentWorkDoc
      ? JSON.stringify(studentWorkDoc.editableContent)
      : "";
    const currentContent = JSON.stringify(editorContent);
    setIsDirty(originalContent !== currentContent);
  }, [editorContent, studentWorkDoc]);

  const handleSaveDraft = async (): Promise<DocumentType | null> => {
    if (!submission || !editorContent) return null;
    try {
      let savedDoc: DocumentType;
      if (studentWorkDoc) {
        const response = await updateDocument({
          documentId: studentWorkDoc.id,
          data: { name: studentWorkDoc.name, content: editorContent },
        }).unwrap();
        // --- FIX: Extract the nested document from the response ---
        savedDoc = response.data.document;
      } else {
        const response = await createDocument({
          name: `Submission for: ${submission.assignment.title}`,
          content: editorContent,
        }).unwrap();
        // --- FIX: Extract the nested document from the response ---
        savedDoc = response.data.document;
      }
      setStudentWorkDoc(savedDoc);
      setIsDirty(false);
      return savedDoc;
    } catch (err) {
      console.error("Failed to save draft:", err);
      return null;
    }
  };
  const handleSubmitWork = async () => {
    if (!submission) return;

    let docToSubmit = studentWorkDoc;

    if (isDirty) {
      const savedDoc = await handleSaveDraft();
      if (!savedDoc) {
        alert(
          "Could not save your latest changes. Please try again before submitting."
        );
        return;
      }
      docToSubmit = savedDoc;
    }

    if (!docToSubmit) {
      alert(
        "There is no work to submit. Please write something and save a draft first."
      );
      return;
    }

    try {
      await submitWork({
        submissionId: submission.id,
        data: { documentId: docToSubmit.id },
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
            disabled={!isDirty || isSaving}
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Draft
          </Button>
          <Button onClick={handleSubmitWork} disabled={isSubmitting}>
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
                initialContent={editorContent}
                onUpdate={(c) => setEditorContent(c ? JSON.parse(c) : null)}
                editable={true}
              />
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
