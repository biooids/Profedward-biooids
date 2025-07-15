// src/components/documents/ShelfActionModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShelfFormValues, shelfFormSchema } from "@/lib/schemas/shelf.schemas";
import { Shelf } from "@/lib/shelf/shelfTypes";
import {
  useCreateShelfMutation,
  useUpdateShelfMutation,
  useDeleteShelfMutation,
} from "@/lib/shelf/shelfApiSlice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Trash2 } from "lucide-react";
import { getApiErrorMessage } from "@/lib/utils";

interface ShelfActionModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  shelf?: Shelf; // If a shelf is passed, we're in "edit" mode
}

export default function ShelfActionModal({
  isOpen,
  onOpenChange,
  shelf,
}: ShelfActionModalProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");

  const mode = shelf ? "edit" : "create";
  const confirmationText = `delete/${shelf?.name}`;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ShelfFormValues>({
    resolver: zodResolver(shelfFormSchema),
    defaultValues: {
      name: shelf?.name || "",
    },
  });

  // Reset form when the modal opens or the shelf data changes
  useEffect(() => {
    if (isOpen) {
      reset({ name: shelf?.name || "" });
    }
  }, [isOpen, shelf, reset]);

  // --- RTK Query Mutations ---
  const [createShelf, { isLoading: isCreating }] = useCreateShelfMutation();
  const [updateShelf, { isLoading: isUpdating }] = useUpdateShelfMutation();
  const [deleteShelf, { isLoading: isDeleting }] = useDeleteShelfMutation();

  const isLoading = isCreating || isUpdating || isDeleting;

  const onSubmit = async (data: ShelfFormValues) => {
    try {
      if (mode === "edit" && shelf) {
        await updateShelf({ shelfId: shelf.id, data }).unwrap();
      } else {
        await createShelf(data).unwrap();
      }
      onOpenChange(false); // Close modal on success
    } catch (err) {
      // RTK Query automatically handles errors, but you can show a toast here
      console.error(`Failed to ${mode} shelf:`, getApiErrorMessage(err as any));
    }
  };

  const handleDelete = async () => {
    if (!shelf) return;
    try {
      await deleteShelf(shelf.id).unwrap();
      setIsDeleteDialogOpen(false);
      onOpenChange(false); // Close the main modal as well
    } catch (err) {
      console.error("Failed to delete shelf:", getApiErrorMessage(err as any));
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {mode === "edit"
                ? `Editing "${shelf?.name}"`
                : "Create New Shelf"}
            </DialogTitle>
            <DialogDescription>
              {mode === "edit"
                ? "Make changes to your shelf here. Click save when you're done."
                : "Give your new shelf a name to get started."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="py-4">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="e.g., Physics - Term 1"
                className="mt-1"
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-sm text-destructive mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>
            <DialogFooter className="sm:justify-between mt-4">
              {mode === "edit" ? (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  disabled={isLoading}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              ) : (
                <div /> // Placeholder for alignment
              )}
              <div className="flex gap-2">
                <DialogClose asChild>
                  <Button type="button" variant="ghost" disabled={isLoading}>
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={isLoading || isSubmitting}>
                  {(isCreating || isUpdating) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Secure Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              <strong className="px-1">"{shelf?.name}"</strong>
              shelf and all documents inside it. To confirm, please type{" "}
              <strong className="text-destructive">
                {confirmationText}
              </strong>{" "}
              below.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            value={deleteInput}
            onChange={(e) => setDeleteInput(e.target.value)}
            placeholder={confirmationText}
            disabled={isDeleting}
          />
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteInput !== confirmationText || isDeleting}
              className="bg-destructive hover:bg-destructive/90"
              onClick={handleDelete}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}I
              understand, delete this shelf
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
