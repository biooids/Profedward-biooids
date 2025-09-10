"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  useGetSubmissionForGradingQuery,
  useGradeSubmissionMutation,
  useSaveGradingDraftMutation, // --- NEW: Import the new mutation hook ---
} from "@/lib/submission/submissionApiSlice";
import {
  useCreateEditableDocumentMutation,
  useUpdateDocumentMutation,
} from "@/lib/document/documentApiSlice";
import { Loader2, Save, Send, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import TiptapEditor from "@/components/editor/TiptapEditor";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Document as DocumentType } from "@/lib/document/documentTypes";
import { Textarea } from "../ui/textarea";

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

export default function GradingWorkspace({
  submissionId,
}: {
  submissionId: string;
}) {
  const router = useRouter();
  const { status: authStatus } = useSession();

  const {
    data: submission,
    isLoading,
    isError,
  } = useGetSubmissionForGradingQuery(submissionId, {
    skip: authStatus !== "authenticated",
    refetchOnMountOrArgChange: true,
  });

  const [createDocument, { isLoading: isCreatingCopy }] =
    useCreateEditableDocumentMutation();
  const [updateDocument] = useUpdateDocumentMutation();
  // --- NEW: Instantiate the new mutation hook ---
  const [saveGradingDraft, { isLoading: isSavingDraft }] =
    useSaveGradingDraftMutation();
  const [gradeSubmission, { isLoading: isGrading }] =
    useGradeSubmissionMutation();

  const [teacherFeedbackDoc, setTeacherFeedbackDoc] =
    useState<DocumentType | null>(null);
  const [grade, setGrade] = useState("");
  const [comments, setComments] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const editorContentRef = useRef<any>(null);

  useEffect(() => {
    if (submission) {
      if (submission.correction?.document) {
        setTeacherFeedbackDoc(submission.correction.document);
        editorContentRef.current =
          submission.correction.document.editableContent;
        setGrade(submission.correction.grade || "");
        setComments(submission.correction.comments || "");
      } else if (submission.document && !teacherFeedbackDoc) {
        // <-- This line reads `teacherFeedbackDoc`
        const createMarkupCopy = async () => {
          try {
            const result = await createDocument({
              name: `Correction for: ${submission.document!.name}`,
              content: submission.document!.editableContent,
            }).unwrap();
            const finalDoc = result.data.document;
            setTeacherFeedbackDoc(finalDoc);
            editorContentRef.current = finalDoc.editableContent;
          } catch (err) {
            toast.error("Failed to create feedback document.");
          }
        };
        createMarkupCopy();
      }
    }
    // Add `teacherFeedbackDoc` to the dependency array to resolve the warning.
  }, [submission, createDocument, teacherFeedbackDoc]);

  // --- NEW: Updated save handler to save everything ---
  const handleSaveForLater = async () => {
    if (!teacherFeedbackDoc) return;

    const promise = new Promise(async (resolve, reject) => {
      try {
        // Step 1: Save the markup document changes
        const docPayload = {
          documentId: teacherFeedbackDoc.id,
          data: {
            name: teacherFeedbackDoc.name,
            content: editorContentRef.current,
          },
        };
        console.log("💾 SAVING MARKUP DOCUMENT. PAYLOAD:", docPayload);
        await updateDocument(docPayload).unwrap();

        // Step 2: Save the grade and comments to the Correction record
        const gradePayload = {
          submissionId,
          data: {
            documentId: teacherFeedbackDoc.id,
            grade: grade,
            comments: comments,
          },
        };
        console.log("💾 SAVING GRADE/COMMENTS. PAYLOAD:", gradePayload);
        await saveGradingDraft(gradePayload).unwrap();

        resolve("Your grading progress has been saved.");
      } catch (err) {
        reject(err);
      }
    });

    toast.promise(promise, {
      loading: "Saving progress...",
      success: (message) => {
        setIsDirty(false);
        return message as string;
      },
      error: "Failed to save progress.",
    });
  };

  const handlePublishGrade = async () => {
    if (!teacherFeedbackDoc) return;

    console.log("🚀 PUBLISHING GRADE. Current state:", { grade, comments });

    const promise = new Promise(async (resolve, reject) => {
      try {
        if (isDirty) {
          // This now saves all draft progress before publishing
          await handleSaveForLater();
        }

        const gradePayload = {
          submissionId,
          data: {
            grade,
            comments,
            documentId: teacherFeedbackDoc.id,
          },
        };
        console.log("Publishing grade with payload:", gradePayload);
        await gradeSubmission(gradePayload).unwrap();
        resolve("Grade published successfully!");
      } catch (err) {
        reject(err);
      }
    });

    toast.promise(promise, {
      loading: "Publishing grade...",
      success: (message) => {
        router.push("/assignments");
        return message as string;
      },
      error: "Failed to publish grade.",
    });
  };

  const isLoadingUI = isLoading || isCreatingCopy || authStatus === "loading";

  if (isLoadingUI) {
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
        <p className="mt-2">
          Submission not found or you do not have permission to view it.
        </p>
      </div>
    );
  }

  const studentDocument = submission.document;
  const isGraded = submission.status === "GRADED";
  const isPublishing = isSavingDraft || isGrading;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <header className="flex justify-between items-center pb-4 border-b">
        <div>
          <h1 className="text-2xl font-bold">{submission.assignment.title}</h1>
          <p className="text-sm text-muted-foreground">
            Grading submission for:{" "}
            <strong>{submission.student.displayName}</strong>
          </p>
        </div>
        {!isGraded && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleSaveForLater}
              disabled={isSavingDraft || !isDirty}
            >
              {isSavingDraft ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save for Later
            </Button>
            <Button
              size="lg"
              onClick={handlePublishGrade}
              disabled={isPublishing}
            >
              {isPublishing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Publish Grade
            </Button>
          </div>
        )}
      </header>

      <ResizablePanelGroup
        direction="horizontal"
        className="flex-1 rounded-lg border mt-4"
      >
        <ResizablePanel defaultSize={50}>
          <div className="flex flex-col h-full">
            <h3 className="p-2 text-sm font-semibold text-center bg-muted border-b">
              Student's Submitted Work (Read-Only)
            </h3>
            <div className="flex-1 overflow-hidden">
              {studentDocument ? (
                <DocumentViewer
                  documentUrl={studentDocument.originalFileUrl}
                  editableContent={studentDocument.editableContent}
                />
              ) : (
                <p className="p-4 text-center text-muted-foreground">
                  Student did not submit a document.
                </p>
              )}
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50}>
          <div className="flex flex-col h-full">
            <h3 className="p-2 text-sm font-semibold text-center bg-primary/10 border-b">
              Teacher's Feedback
            </h3>
            <div className="flex flex-col gap-4 p-4">
              <div className="space-y-1.5">
                <Label htmlFor="grade">Grade</Label>
                <Input
                  id="grade"
                  value={grade}
                  onChange={(e) => {
                    setGrade(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="e.g., A+ or 95/100"
                  readOnly={isGraded}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Overall Comments</Label>
                <Textarea
                  value={comments}
                  onChange={(e) => {
                    setComments(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="Provide summary feedback..."
                  readOnly={isGraded}
                />
              </div>
            </div>
            <h3 className="p-2 text-sm font-semibold text-center bg-primary/10 border-b border-t">
              Marked-up Copy
            </h3>
            <div className="flex-1 overflow-y-auto">
              {teacherFeedbackDoc ? (
                <TiptapEditor
                  key={teacherFeedbackDoc.id}
                  initialContent={teacherFeedbackDoc.editableContent}
                  onUpdate={(content) => {
                    editorContentRef.current = JSON.parse(content);
                    setIsDirty(true);
                  }}
                  editable={!isGraded}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin" />{" "}
                  <p className="ml-4">Preparing feedback document...</p>
                </div>
              )}
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
