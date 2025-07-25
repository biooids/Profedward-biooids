// src/components/admin/AcademicSettingsDashboard.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  useGetAcademicLevelsQuery,
  useCreateAcademicLevelMutation,
  useUpdateAcademicLevelMutation,
  useDeleteAcademicLevelMutation,
  useGetSubjectsQuery,
  useCreateSubjectMutation,
  useUpdateSubjectMutation,
  useDeleteSubjectMutation,
} from "@/lib/academic/academicApiSlice";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
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
import { Loader2, Edit, Trash2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
});
type FormValues = z.infer<typeof formSchema>;

// This helper type describes the tuple `[trigger, result]` that all RTK Query mutation hooks return.
// We only care about the trigger function and the `isLoading` property from the result.
type MutationHook = () => readonly [
  (arg: any) => any, // The trigger function
  { isLoading: boolean } // The result object
];

// This interface now uses our custom `MutationHook` type for its props.
interface SettingManagerProps {
  title: string;
  description: string;
  items: { id: string; name: string }[];
  useCreateMutation: MutationHook;
  useUpdateMutation: MutationHook;
  useDeleteMutation: MutationHook;
}

const SettingManager = ({
  title,
  description,
  items,
  useCreateMutation,
  useUpdateMutation,
  useDeleteMutation,
}: SettingManagerProps) => {
  const [createItem, { isLoading: isCreating }] = useCreateMutation();
  const [updateItem] = useUpdateMutation();
  const [deleteItem] = useDeleteMutation();

  const [editingItem, setEditingItem] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  const form = useForm<FormValues>({ resolver: zodResolver(formSchema) });

  const onSubmit = async (data: FormValues) => {
    const promise = editingItem
      ? updateItem({ id: editingItem.id, data }).unwrap()
      : createItem(data).unwrap();

    toast.promise(promise, {
      loading: `${editingItem ? "Updating" : "Creating"} ${title.slice(
        0,
        -1
      )}...`,
      success: () => {
        form.reset({ name: "" });
        setEditingItem(null);
        return `${title.slice(0, -1)} ${
          editingItem ? "updated" : "created"
        } successfully!`;
      },
      error: (err) =>
        err.data?.message ||
        `Failed to ${editingItem ? "update" : "create"} ${title.slice(0, -1)}.`,
    });
  };

  const handleDeleteConfirm = () => {
    if (!deletingItemId) return;
    const promise = deleteItem(deletingItemId).unwrap();
    toast.promise(promise, {
      loading: `Deleting ${title.slice(0, -1)}...`,
      success: `${title.slice(0, -1)} deleted successfully!`,
      error: (err) =>
        err.data?.message || `Failed to delete. It may be in use.`,
    });
    setDeletingItemId(null);
  };

  const handleEditClick = (item: { id: string; name: string }) => {
    setEditingItem(item);
    form.setValue("name", item.name);
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    form.reset({ name: "" });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex gap-2 mb-4"
        >
          <Input
            {...form.register("name")}
            placeholder={
              editingItem
                ? `Update "${editingItem.name}"`
                : `e.g., New ${title.slice(0, -1)}`
            }
          />
          <Button type="submit" disabled={isCreating}>
            {isCreating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : editingItem ? (
              "Update"
            ) : (
              "Add"
            )}
          </Button>
          {editingItem && (
            <Button variant="ghost" onClick={handleCancelEdit}>
              Cancel
            </Button>
          )}
        </form>
        <div className="border rounded-md max-h-60 overflow-y-auto">
          <Table>
            <TableBody>
              {items.length > 0 ? (
                items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditClick(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeletingItemId(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell className="text-center text-muted-foreground">
                    No {title.toLowerCase()} found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <AlertDialog
        open={!!deletingItemId}
        onOpenChange={() => setDeletingItemId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              item. If it's in use by any courses, this may fail.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default function AcademicSettingsDashboard() {
  const { data: levels = [] } = useGetAcademicLevelsQuery();
  const { data: subjects = [] } = useGetSubjectsQuery();

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <SettingManager
        title="Academic Levels"
        description="Manage grade levels, university years, etc."
        items={levels}
        useCreateMutation={useCreateAcademicLevelMutation}
        useUpdateMutation={useUpdateAcademicLevelMutation}
        useDeleteMutation={useDeleteAcademicLevelMutation}
      />
      <SettingManager
        title="Subjects"
        description="Manage the subjects that can be taught."
        items={subjects}
        useCreateMutation={useCreateSubjectMutation}
        useUpdateMutation={useUpdateSubjectMutation}
        useDeleteMutation={useDeleteSubjectMutation}
      />
    </div>
  );
}
