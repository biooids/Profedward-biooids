"use client";

import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Course } from "@/lib/course/courseTypes";
import { useUpdateCourseDetailsMutation } from "@/lib/course/courseApiSlice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Trash2, PlusCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const resourceSchema = z.object({
  label: z.string().min(1, "Label cannot be empty."),
  url: z.string().url("Please enter a valid URL."),
});

const syllabusSchema = z.object({
  description: z.string().optional(),
  teacherMethodology: z.string().optional(),
  teacherContactInfo: z.string().optional(),
  resources: z.array(resourceSchema).optional(),
});
type SyllabusFormValues = z.infer<typeof syllabusSchema>;

interface EditSyllabusModalProps {
  course: Course;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export default function EditSyllabusModal({
  course,
  isOpen,
  onOpenChange,
}: EditSyllabusModalProps) {
  const [updateCourseDetails, { isLoading }] = useUpdateCourseDetailsMutation();

  const {
    control,
    handleSubmit,
    setError,
    formState: { isDirty, errors },
  } = useForm<SyllabusFormValues>({
    resolver: zodResolver(syllabusSchema),
    defaultValues: {
      description: course.description || "",
      teacherMethodology: course.teacherMethodology || "",
      teacherContactInfo: course.teacherContactInfo || "",
      resources: Array.isArray(course.resources) ? course.resources : [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "resources",
  });

  const onSubmit = async (data: SyllabusFormValues) => {
    const payload = {
      description: data.description,
      teacherMethodology: data.teacherMethodology,
      teacherContactInfo: data.teacherContactInfo,
      resources: data.resources,
    };

    const promise = updateCourseDetails({
      courseId: course.id,
      data: payload,
    }).unwrap();

    toast.promise(promise, {
      loading: "Saving syllabus...",
      success: () => {
        onOpenChange(false);
        return "Syllabus updated successfully!";
      },
      error: (err) => err.data?.message || "Failed to update syllabus.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Course Syllabus & Details</DialogTitle>
          <DialogDescription>
            Update the information students will see on the course overview
            page.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <div className="space-y-1.5">
                <Label htmlFor="description">Course Description</Label>
                <Textarea
                  id="description"
                  placeholder="A general overview of the course..."
                  {...field}
                />
              </div>
            )}
          />
          <Controller
            name="teacherMethodology"
            control={control}
            render={({ field }) => (
              <div className="space-y-1.5">
                <Label htmlFor="teacherMethodology">Teaching Methodology</Label>
                <Textarea
                  id="teacherMethodology"
                  placeholder="e.g., Project-based, lectures, labs..."
                  {...field}
                />
              </div>
            )}
          />
          <Controller
            name="teacherContactInfo"
            control={control}
            render={({ field }) => (
              <div className="space-y-1.5">
                <Label htmlFor="teacherContactInfo">
                  Contact & Office Hours
                </Label>
                <Input
                  id="teacherContactInfo"
                  placeholder="e.g., By email, office hours Mon 3-4pm"
                  {...field}
                />
              </div>
            )}
          />

          <Separator />

          <div className="space-y-4">
            <Label className="font-semibold">Resources & Links</Label>
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-start gap-2">
                <div className="grid grid-cols-2 gap-2 flex-grow">
                  <Controller
                    name={`resources.${index}.label`}
                    control={control}
                    render={({ field }) => (
                      <Input placeholder="Label (e.g., Textbook)" {...field} />
                    )}
                  />
                  <Controller
                    name={`resources.${index}.url`}
                    control={control}
                    render={({ field }) => (
                      <Input placeholder="URL (e.g., https://...)" {...field} />
                    )}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {errors.resources?.root && (
              <p className="text-sm text-destructive">
                {errors.resources.root.message}
              </p>
            )}
            {Array.isArray(errors.resources) &&
              errors.resources.map(
                (error, index) =>
                  error && (
                    <div key={index} className="text-sm text-destructive">
                      {error.label && (
                        <p>
                          Resource #{index + 1} Label: {error.label.message}
                        </p>
                      )}
                      {error.url && (
                        <p>
                          Resource #{index + 1} URL: {error.url.message}
                        </p>
                      )}
                    </div>
                  )
              )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ label: "", url: "" })}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Resource
            </Button>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !isDirty}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
