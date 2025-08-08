//src/components/teacher/CreateAssignmentWorkflow.tsx

"use client";

import { useState } from "react";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
      path: ["documentSource"],
    }
  );

type AssignmentFormValues = z.infer<typeof assignmentSchema>;
type DocumentSource = "upload" | "create";

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

  const [pendingTab, setPendingTab] = useState<DocumentSource | null>(null);

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

  // --- UPDATED LOGIC ---
  // This function will now ALWAYS trigger the confirmation dialog
  // if the user clicks a different tab than the one they are on.
  const handleTabChange = (nextTab: DocumentSource) => {
    if (documentSource !== nextTab) {
      setPendingTab(nextTab);
    }
  };

  const handleConfirmSwitch = () => {
    if (!pendingTab) return;

    // Clear the state of the tab we are leaving.
    // This is safe even if there's no data to clear.
    if (pendingTab === "create") {
      setValue("file", undefined, { shouldValidate: true });
    } else if (pendingTab === "upload") {
      setValue("editorContent", null, { shouldValidate: true });
      // You may need to add a way to imperatively clear your TiptapEditor instance if it holds its own internal state
    }

    // Complete the switch
    setValue("documentSource", pendingTab, { shouldValidate: true });
    setPendingTab(null); // Close the dialog
  };

  const handleEditorUpdate = (content: string) => {
    try {
      const parsedContent = JSON.parse(content);
      const isEditorEmpty =
        !parsedContent.content ||
        (parsedContent.content.length === 1 &&
          !parsedContent.content[0].content);
      setValue("editorContent", isEditorEmpty ? null : parsedContent, {
        shouldValidate: true,
      });
    } catch (error) {
      console.error("Failed to parse editor content:", error);
      setValue("editorContent", null, { shouldValidate: true });
    }
  };

  const onSubmit = async (data: AssignmentFormValues) => {
    let documentId = "";
    const creationPromise = new Promise<void>(async (resolve, reject) => {
      try {
        if (data.documentSource === "upload" && data.file) {
          const formData = new FormData();
          formData.append("documentFile", data.file);
          formData.append("name", data.title);
          const uploadResult = await uploadDocument(formData).unwrap();
          documentId = uploadResult.data.document.id;
        } else if (data.documentSource === "create" && data.editorContent) {
          const newDocResult = await createEditableDoc({
            name: data.title,
            content: data.editorContent,
          }).unwrap();
          documentId = newDocResult.data.document.id;
        }

        if (!documentId) throw new Error("Document creation failed.");

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
      loading: "Creating assignment...",
      success: () => {
        router.push(`/courses/${courseId}/teacher-view`);
        return "Assignment published successfully!";
      },
      error: (err) => err.data?.message || "An error occurred.",
    });
  };

  return (
    <>
      <AlertDialog open={!!pendingTab} onOpenChange={() => setPendingTab(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to switch?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Any information on the current tab will be cleared. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSwitch}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
                <p className="text-sm text-destructive">
                  {errors.title.message}
                </p>
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
                handleTabChange(value as DocumentSource)
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
                  onChange={(e) =>
                    setValue("file", e.target.files?.[0], {
                      shouldValidate: true,
                    })
                  }
                />
              </TabsContent>
              <TabsContent value="create" className="pt-4 border-t">
                <TiptapEditor onUpdate={handleEditorUpdate} editable={true} />
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
    </>
  );
}
