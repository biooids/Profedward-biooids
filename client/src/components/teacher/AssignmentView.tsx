"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useGetAssignmentByIdQuery } from "@/lib/assignment/assignmentApiSlice";
import { useUpdateDocumentMutation } from "@/lib/document/documentApiSlice";
import { Loader2, Save, Edit, FileScan } from "lucide-react";
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/layouts/PageHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TiptapEditor from "@/components/editor/TiptapEditor";

// Dynamically import the DocumentViewer with SSR turned off
const DocumentViewer = dynamic(
  () => import("@/components/documents/view/DocumentViewer"),
  { ssr: false, loading: () => <p>Loading Viewer...</p> }
);

export default function AssignmentView({
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

  // State to manage unsaved changes
  const [editorContent, setEditorContent] = useState<any>(null);
  const [isDirty, setIsDirty] = useState(false);

  // Effect to populate the editor when data loads
  useEffect(() => {
    if (assignment?.document.editableContent) {
      setEditorContent(assignment.document.editableContent);
    }
  }, [assignment]);

  // Effect to detect if there are unsaved changes
  useEffect(() => {
    if (!assignment || !editorContent) return;
    const originalContent = JSON.stringify(assignment.document.editableContent);
    const currentContent = JSON.stringify(editorContent);
    setIsDirty(originalContent !== currentContent);
  }, [editorContent, assignment]);

  // Handler to save the document
  const handleSaveChanges = async () => {
    if (!assignment || !isDirty || isSaving) return;
    try {
      await updateDocument({
        documentId: assignment.document.id,
        data: { content: editorContent },
      }).unwrap();
      setIsDirty(false); // Reset dirty state after saving
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
        <div className="flex justify-between items-center">
          <div>
            <PageHeaderHeading>{assignment.title}</PageHeaderHeading>
            <PageHeaderDescription>
              Due:{" "}
              {assignment.dueDate
                ? new Date(assignment.dueDate).toLocaleString()
                : "No due date"}
            </PageHeaderDescription>
          </div>
          {hasEditableContent && (
            <Button onClick={handleSaveChanges} disabled={!isDirty || isSaving}>
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Changes
            </Button>
          )}
        </div>
      </PageHeader>

      <Tabs defaultValue={defaultTab} className="flex-1 flex flex-col mt-4">
        <TabsList>
          {hasEditableContent && (
            <TabsTrigger value="editor">
              <Edit className="mr-2 h-4 w-4" /> Editor
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
