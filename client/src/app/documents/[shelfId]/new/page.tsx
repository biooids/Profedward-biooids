// app/documents/[shelfId]/new/page.tsx
"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createDocumentSchema,
  CreateDocumentFormValues,
} from "@/lib/schemas/document.schemas";
import { useCreateEditableDocumentMutation } from "@/lib/document/documentApiSlice";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import TiptapEditor from "@/components/editor/TiptapEditor";
import { Loader2, Save, ArrowLeft, AlertCircle } from "lucide-react";
import { getApiErrorMessage } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function NewDocumentInShelfPage() {
  const router = useRouter();
  const params = useParams();
  const shelfId = params.shelfId as string;

  const [createDocument, { isLoading }] = useCreateEditableDocumentMutation();

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateDocumentFormValues>({
    resolver: zodResolver(createDocumentSchema),
    defaultValues: {
      title: "", // Start with an empty title to encourage user input
      content: "",
    },
  });

  const onSubmit: SubmitHandler<CreateDocumentFormValues> = async (data) => {
    try {
      const response = await createDocument({
        name: data.title,
        content: JSON.parse(data.content),
        shelfId,
      }).unwrap();

      const newDocument = response.data.document;
      router.push(`/documents/${newDocument.shelfId}/${newDocument.id}`);
    } catch (err: any) {
      const errorMessage = getApiErrorMessage(err);
      setError("root", { message: errorMessage });
      console.error("Failed to create document:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/documents/${shelfId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">New Document</h1>
        </div>
        <Button
          onClick={handleSubmit(onSubmit)}
          disabled={isLoading || isSubmitting}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save and Publish
        </Button>
      </div>

      {/* Form Fields */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Title Input */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-base">
            Document Title
          </Label>
          <Input
            id="title"
            {...register("title")}
            placeholder="e.g., Quantum Mechanics Lecture Notes"
            autoFocus
          />
          {errors.title && (
            <p className="text-sm text-destructive">{errors.title.message}</p>
          )}
        </div>

        {/* Tiptap Editor */}
        <div className="space-y-2">
          <Label className="text-base">Content</Label>
          <Controller
            name="content"
            control={control}
            render={({ field }) => (
              <TiptapEditor
                onUpdate={field.onChange}
                initialContent={field.value}
                hasError={!!errors.content}
              />
            )}
          />
          {errors.content && (
            <p className="text-sm text-destructive">{errors.content.message}</p>
          )}
        </div>

        {errors.root && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errors.root.message}</AlertDescription>
          </Alert>
        )}

        {/* The submit button is now in the header, but this form tag wraps the fields */}
      </form>
    </div>
  );
}
