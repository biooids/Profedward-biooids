"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useUploadDocumentMutation,
  useCreateEditableDocumentMutation,
} from "@/lib/document/documentApiSlice";
import {
  assignmentDocumentUploadSchema,
  AssignmentDocumentUploadValues,
} from "@/lib/schemas/assignment.schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, UploadCloud, FilePlus2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import TiptapEditor from "@/components/editor/TiptapEditor";

interface AssignmentDocumentManagerProps {
  onDocumentCreated: (id: string, name: string) => void;
  initialDocumentName: string;
}

export default function AssignmentDocumentManager({
  onDocumentCreated,
  initialDocumentName,
}: AssignmentDocumentManagerProps) {
  const [mode, setMode] = useState<"upload" | "scratch">("upload");
  const [uploadDocument, { isLoading: isUploading }] =
    useUploadDocumentMutation();
  const [createEditableDocument, { isLoading: isCreating }] =
    useCreateEditableDocumentMutation();

  const uploadForm = useForm<AssignmentDocumentUploadValues>({
    resolver: zodResolver(assignmentDocumentUploadSchema),
  });

  const [tiptapContent, setTiptapContent] = useState("");
  const [scratchDocName, setScratchDocName] = useState(initialDocumentName);

  const onUploadSubmit = async (data: AssignmentDocumentUploadValues) => {
    const formData = new FormData();
    formData.append("name", initialDocumentName); // Use assignment title for doc name
    formData.append("documentFile", data.documentFile[0]);
    try {
      const response = await uploadDocument(formData).unwrap();
      // FIX: Extract the document from the nested response object
      const newDoc = response.data.document;
      onDocumentCreated(newDoc.id, newDoc.name);
    } catch (err) {
      console.error("Failed to upload document:", err);
    }
  };

  const onScratchSubmit = async () => {
    if (!scratchDocName || !tiptapContent) {
      alert("Please provide a name and content for the document.");
      return;
    }
    try {
      const response = await createEditableDocument({
        name: scratchDocName,
        content: JSON.parse(tiptapContent),
      }).unwrap();
      // FIX: Extract the document from the nested response object
      const newDoc = response.data.document;
      onDocumentCreated(newDoc.id, newDoc.name);
    } catch (err) {
      console.error("Failed to create document from scratch:", err);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Step 2: Assignment Worksheet</CardTitle>
        <CardDescription>
          Choose a method to create the document for this assignment.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ToggleGroup
          type="single"
          value={mode}
          onValueChange={(value: "upload" | "scratch") =>
            value && setMode(value)
          }
          className="mb-4 w-full"
        >
          <ToggleGroupItem value="upload" className="w-1/2">
            <UploadCloud className="mr-2 h-4 w-4" /> Upload File
          </ToggleGroupItem>
          <ToggleGroupItem value="scratch" className="w-1/2">
            <FilePlus2 className="mr-2 h-4 w-4" /> Create from Scratch
          </ToggleGroupItem>
        </ToggleGroup>

        {mode === "upload" && (
          <div className="p-6 border-2 border-dashed rounded-lg">
            <form
              onSubmit={uploadForm.handleSubmit(onUploadSubmit)}
              className="flex flex-col items-center gap-4"
            >
              <p className="text-sm text-center text-muted-foreground">
                Upload a PDF or Word document.
              </p>
              <div className="flex items-center gap-2">
                <Input
                  id="doc-upload"
                  type="file"
                  {...uploadForm.register("documentFile")}
                />
                <Button type="submit" disabled={isUploading}>
                  {isUploading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Upload
                </Button>
              </div>
              {uploadForm.formState.errors.documentFile && (
                <p className="text-sm text-destructive mt-2">
                  {uploadForm.formState.errors.documentFile.message as string}
                </p>
              )}
            </form>
          </div>
        )}

        {mode === "scratch" && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="scratch-doc-name">Document Name</Label>
              <Input
                id="scratch-doc-name"
                value={scratchDocName}
                onChange={(e) => setScratchDocName(e.target.value)}
              />
            </div>
            <TiptapEditor onUpdate={setTiptapContent} />
            <Button onClick={onScratchSubmit} disabled={isCreating}>
              {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Document
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
