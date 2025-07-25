"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  useUploadDocumentMutation,
  useCreateEditableDocumentMutation,
} from "@/lib/document/documentApiSlice";
import { useCreateAssignmentMutation } from "@/lib/assignment/assignmentApiSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Upload,
  FilePlus,
  Calendar as CalendarIcon,
  Loader2,
} from "lucide-react";
import TiptapEditor from "../editor/TiptapEditor";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Zod schema for form validation
const assignmentSchema = z
  .object({
    title: z.string().min(3, "Title must be at least 3 characters."),
    instructions: z.string().optional(),
    dueDate: z.date().optional(),
    documentSource: z.enum(["upload", "create"]),
    file: z.instanceof(File).optional(),
    editorContent: z.any().optional(),
  })
  .refine(
    (data) => {
      if (data.documentSource === "upload") return !!data.file;
      if (data.documentSource === "create") return !!data.editorContent;
      return false;
    },
    {
      message:
        "You must either upload a file or create a document from scratch.",
      path: ["documentSource"], // This error will be associated with the tabs
    }
  );

type AssignmentFormValues = z.infer<typeof assignmentSchema>;

export default function CreateAssignmentWorkflow({
  courseId,
}: {
  courseId: string;
}) {
  const router = useRouter();
  const [uploadDocument, { isLoading: isUploading }] =
    useUploadDocumentMutation();
  const [createEditableDoc, { isLoading: isCreatingDoc }] =
    useCreateEditableDocumentMutation();
  const [createAssignment, { isLoading: isCreatingAssignment }] =
    useCreateAssignmentMutation();

  const isLoading = isUploading || isCreatingDoc || isCreatingAssignment;

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      title: "",
      documentSource: "upload",
    },
  });

  const documentSource = watch("documentSource");

  // --- INTELLIGENT STATE HANDLING ---
  // This logic prevents the user from providing two document sources.
  const handleFileChange = (file: File | undefined) => {
    if (file) {
      setValue("file", file, { shouldValidate: true });
      // If a file is uploaded, clear the editor content to avoid conflict.
      setValue("editorContent", null, { shouldValidate: true });
    }
  };

  const handleEditorUpdate = (content: string) => {
    const parsedContent = JSON.parse(content);
    // Check if the editor is not empty before setting the value
    const isEditorEmpty =
      !parsedContent.content ||
      (parsedContent.content.length === 1 && !parsedContent.content[0].content);

    if (!isEditorEmpty) {
      setValue("editorContent", parsedContent, { shouldValidate: true });
      // If content is added to the editor, clear the uploaded file.
      setValue("file", undefined, { shouldValidate: true });
    } else {
      setValue("editorContent", null, { shouldValidate: true });
    }
  };

  // Main submission handler
  const onSubmit = async (data: AssignmentFormValues) => {
    let documentId = "";

    const creationPromise = new Promise<void>(async (resolve, reject) => {
      try {
        // Step 1: Create the document based on the selected source
        if (data.documentSource === "upload" && data.file) {
          const formData = new FormData();
          formData.append("documentFile", data.file);
          formData.append("name", data.title); // Use assignment title as document name
          const uploadResult = await uploadDocument(formData).unwrap();
          documentId = uploadResult.data.document.id;
        } else if (data.documentSource === "create" && data.editorContent) {
          const newDocResult = await createEditableDoc({
            name: data.title,
            content: data.editorContent,
          }).unwrap();
          documentId = newDocResult.data.document.id;
        }

        if (!documentId) {
          throw new Error("Failed to create the assignment document.");
        }

        // Step 2: Create the assignment and link the new document
        await createAssignment({
          courseId,
          documentId,
          title: data.title,
          instructions: data.instructions,
          dueDate: data.dueDate?.toISOString(),
        }).unwrap();

        resolve();
      } catch (err) {
        reject(err);
      }
    });

    toast.promise(creationPromise, {
      loading: "Creating and publishing assignment...",
      success: () => {
        router.push(`/courses/${courseId}/teacher-view`);
        return "Assignment published successfully!";
      },
      error: (err) => err.data?.message || "An error occurred.",
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 mt-6">
      <Card>
        <CardHeader>
          <CardTitle>1. Assignment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register("title")} />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="instructions">Instructions (Optional)</Label>
            <Textarea id="instructions" {...register("instructions")} />
          </div>
          <div className="space-y-1.5">
            <Label>Due Date (Optional)</Label>
            <Controller
              name="dueDate"
              control={control}
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. Assignment Document</CardTitle>
          <CardDescription>
            Provide the worksheet by uploading a file or creating one from
            scratch.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={documentSource}
            onValueChange={(value) =>
              setValue("documentSource", value as "upload" | "create")
            }
          >
            <TabsList>
              <TabsTrigger value="upload">
                <Upload className="mr-2 h-4 w-4" />
                Upload File
              </TabsTrigger>
              <TabsTrigger value="create">
                <FilePlus className="mr-2 h-4 w-4" />
                Create from Scratch
              </TabsTrigger>
            </TabsList>
            <TabsContent value="upload" className="pt-4">
              <Input
                type="file"
                onChange={(e) => handleFileChange(e.target.files?.[0])}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Note: Uploading a new file will clear any content you've written
                in the "Create from Scratch" editor.
              </p>
            </TabsContent>
            <TabsContent value="create" className="pt-4 border-t">
              <TiptapEditor onUpdate={handleEditorUpdate} editable={true} />
              <p className="text-xs text-muted-foreground mt-2">
                Note: Writing in the editor will remove any file you've selected
                for upload.
              </p>
            </TabsContent>
          </Tabs>
          {errors.documentSource && (
            <p className="text-sm text-destructive mt-2">
              {errors.documentSource.message}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Publish Assignment
        </Button>
      </div>
    </form>
  );
}
