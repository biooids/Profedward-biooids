// src/components/documents/DocumentActionModal.tsx
"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation"; // 1. Import useRouter for redirection
import { zodResolver } from "@hookform/resolvers/zod";
import {
  uploadDocumentSchema,
  updateDocumentSchema,
  UploadDocumentFormValues,
} from "@/lib/schemas/document.schemas";
import { Document } from "@/lib/document/documentTypes";
import {
  useUploadDocumentMutation,
  useUpdateDocumentMutation,
} from "@/lib/document/documentApiSlice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { getApiErrorMessage } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DocumentActionModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  shelfId: string;
  document?: Document;
}

export default function DocumentActionModal({
  isOpen,
  onOpenChange,
  shelfId,
  document,
}: DocumentActionModalProps) {
  const router = useRouter(); // 2. Initialize the router
  const mode = document ? "edit" : "upload";
  const currentSchema =
    mode === "edit" ? updateDocumentSchema : uploadDocumentSchema;

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<UploadDocumentFormValues>({
    resolver: zodResolver(currentSchema),
  });

  useEffect(() => {
    if (isOpen) {
      reset({ name: document?.name || "" });
    }
  }, [isOpen, document, reset]);

  const [uploadDocument, { isLoading: isUploading }] =
    useUploadDocumentMutation();
  const [updateDocument, { isLoading: isUpdating }] =
    useUpdateDocumentMutation();

  const isLoading = isUploading || isUpdating;

  const onSubmit = async (data: any) => {
    try {
      if (mode === "edit" && document) {
        await updateDocument({
          documentId: document.id,
          data: { name: data.name },
        }).unwrap();
        onOpenChange(false); // Just close the modal on edit
      } else {
        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("documentFile", data.documentFile[0]);
        formData.append("shelfId", shelfId);

        // --- 3. THE FIX: Redirect after upload ---
        const response = await uploadDocument(formData).unwrap();
        const newDocument = response.data.document;
        onOpenChange(false); // Close the modal
        // Redirect to the new document's page
        router.push(`/documents/${newDocument.shelfId}/${newDocument.id}`);
      }
    } catch (err: any) {
      const errorMessage = getApiErrorMessage(err);
      setError("root", { message: errorMessage });
      console.error(`Failed to ${mode} document:`, err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit Document Name" : "Upload a New Document"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Rename your document. Click save when you're done."
              : `This document will be added to the current shelf.`}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 py-4">
            <div className="space-y-1">
              <Label htmlFor="name">Document Name</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="e.g., Quantum Physics Final Paper"
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-sm text-destructive mt-1">
                  {errors.name.message as string}
                </p>
              )}
            </div>
            {mode === "upload" && (
              <div className="space-y-1">
                <Label htmlFor="documentFile">File</Label>
                <Input
                  id="documentFile"
                  type="file"
                  accept=".pdf" // It's good practice to specify accepted file types
                  {...register("documentFile")}
                  disabled={isLoading}
                />
                {errors.documentFile && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.documentFile.message as string}
                  </p>
                )}
              </div>
            )}
          </div>
          {errors.root && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{errors.root.message}</AlertDescription>
            </Alert>
          )}
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button type="button" variant="ghost" disabled={isLoading}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading || isSubmitting}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "edit" ? "Save Changes" : "Upload"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
