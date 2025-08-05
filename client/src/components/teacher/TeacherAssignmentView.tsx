//src/components/teacher/TeacherAssignmentView.tsx
"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useGetAssignmentByIdQuery } from "@/lib/assignment/assignmentApiSlice";
import { useUpdateDocumentMutation } from "@/lib/document/documentApiSlice";
import { Loader2, Save, Edit, FileScan, Clock, Info } from "lucide-react"; // 1. Import Info icon
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/layouts/PageHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TiptapEditor from "@/components/editor/TiptapEditor";
import { Badge } from "@/components/ui/badge";
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

export default function TeacherAssignmentView({
  assignmentId,
}: {
  assignmentId: string;
}) {
  const {
    data: assignment,
    isLoading,
    isError,
  } = useGetAssignmentByIdQuery(assignmentId);
  const [updateDocument, { isLoading: isSaving }] = useUpdateDocumentMutation();

  const [editorContent, setEditorContent] = useState<any>(null);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (assignment?.document.editableContent) {
      setEditorContent(assignment.document.editableContent);
    }
  }, [assignment]);

  useEffect(() => {
    if (!assignment || !editorContent) return;
    const originalContent = JSON.stringify(assignment.document.editableContent);
    const currentContent = JSON.stringify(editorContent);
    setIsDirty(originalContent !== currentContent);
  }, [editorContent, assignment]);

  const handleSaveChanges = async () => {
    if (!assignment || !isDirty || isSaving) return;
    try {
      await updateDocument({
        documentId: assignment.document.id,
        data: {
          name: assignment.document.name,
          content: editorContent,
        },
      }).unwrap();
      setIsDirty(false);
    } catch (error) {
      console.error("Failed to save changes:", error);
    }
  };

  if (isLoading) {
    return <Loader2 className="h-8 w-8 animate-spin" />;
  }

  if (isError || !assignment) {
    return <p className="text-destructive">Could not load assignment.</p>;
  }

  const hasEditableContent = !!assignment.document.editableContent;
  const hasOriginalScan = !!assignment.document.originalFileUrl;
  const defaultTab = hasEditableContent ? "editor" : "scan";

  return (
    <div className="flex flex-col h-full">
      <PageHeader>
        <div className="flex flex-col gap-4">
          {" "}
          {/* Increased gap for better spacing */}
          <div className="flex justify-between items-start">
            <div className="flex-1">
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
            {hasEditableContent && (
              <Button
                onClick={handleSaveChanges}
                disabled={!isDirty || isSaving}
              >
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Changes
              </Button>
            )}
          </div>
          {/* --- MODIFIED INSTRUCTIONS SECTION --- */}
          {assignment.instructions && (
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1" className="border rounded-lg">
                <AccordionTrigger
                  // 2. Add classes to style the trigger like an outline button
                  className="px-4 py-3 hover:no-underline hover:bg-accent rounded-t-lg data-[state=open]:bg-accent data-[state=open]:rounded-b-none"
                >
                  <div className="flex items-center">
                    <Info className="mr-2 h-4 w-4" />
                    <span>View Instructions</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-4 pt-2">
                  <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                    {assignment.instructions}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </div>
      </PageHeader>

      <Tabs defaultValue={defaultTab} className="flex-1 flex flex-col mt-4">
        <TabsList>
          {hasEditableContent && (
            <TabsTrigger value="editor">
              <Edit className="mr-2 h-4 w-4" /> Worksheet Editor
            </TabsTrigger>
          )}
          {hasOriginalScan && (
            <TabsTrigger value="scan">
              <FileScan className="mr-2 h-4 w-4" /> Original Scan
            </TabsTrigger>
          )}
        </TabsList>

        {hasEditableContent && (
          <TabsContent
            value="editor"
            className="flex-1 mt-2 border rounded-lg overflow-hidden"
          >
            <TiptapEditor
              key={assignment.document.id}
              initialContent={assignment.document.editableContent}
              onUpdate={(c) => setEditorContent(JSON.parse(c))}
              editable={true}
            />
          </TabsContent>
        )}

        {hasOriginalScan && (
          <TabsContent
            value="scan"
            className="flex-1 mt-2 border rounded-lg overflow-hidden"
          >
            <DocumentViewer
              documentUrl={assignment.document.originalFileUrl}
              editableContent={null}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
