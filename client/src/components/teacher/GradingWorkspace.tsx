//src/components/teacher/GradingWorkspace.tsx
"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  useGetSubmissionForGradingQuery,
  useGradeSubmissionMutation,
} from "@/lib/submission/submissionApiSlice";
import { useCreateEditableDocumentMutation } from "@/lib/document/documentApiSlice";
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
  const {
    data: submission,
    isLoading,
    isError,
  } = useGetSubmissionForGradingQuery(submissionId);

  const [createDocument, { isLoading: isCreatingCopy }] =
    useCreateEditableDocumentMutation();
  const [gradeSubmission, { isLoading: isGrading }] =
    useGradeSubmissionMutation();

  const [teacherFeedbackDoc, setTeacherFeedbackDoc] =
    useState<DocumentType | null>(null);
  const [grade, setGrade] = useState("");
  const [comments, setComments] = useState("");

  // This effect prepares the teacher's feedback document
  useEffect(() => {
    if (submission) {
      if (submission.correction?.document) {
        // If already graded, load the existing feedback document
        setTeacherFeedbackDoc(submission.correction.document);
        setGrade(submission.correction.grade || "");
        setComments(submission.correction.comments || "");
      } else if (submission.document && !teacherFeedbackDoc) {
        // If grading for the first time, create a copy of the student's work to mark up
        const createMarkupCopy = async () => {
          try {
            const result = await createDocument({
              name: `Correction for: ${submission.document!.name}`,
              content: submission.document!.editableContent,
            }).unwrap();
            setTeacherFeedbackDoc(result.data.document);
          } catch (err) {
            toast.error("Failed to create feedback document.");
          }
        };
        createMarkupCopy();
      }
    }
  }, [submission, createDocument, teacherFeedbackDoc]);

  const handlePublishGrade = async () => {
    if (!teacherFeedbackDoc) return;
    const promise = gradeSubmission({
      submissionId,
      data: {
        grade,
        comments,
        documentId: teacherFeedbackDoc.id,
      },
    }).unwrap();

    toast.promise(promise, {
      loading: "Publishing grade...",
      success: () => {
        router.push("/assignments");
        return "Grade published successfully!";
      },
      error: "Failed to publish grade.",
    });
  };

  const isLoadingUI = isLoading || isCreatingCopy;

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
        Submission not found.
      </div>
    );
  }

  const studentDocument = submission.document;
  const isGraded = submission.status === "GRADED";

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
          <Button size="lg" onClick={handlePublishGrade} disabled={isGrading}>
            {isGrading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Publish Grade
          </Button>
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
                  onChange={(e) => setGrade(e.target.value)}
                  placeholder="e.g., A+ or 95/100"
                  readOnly={isGraded}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Overall Comments</Label>
                <Textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
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
                  onUpdate={(content) =>
                    setTeacherFeedbackDoc({
                      ...teacherFeedbackDoc,
                      editableContent: JSON.parse(content),
                    })
                  }
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
