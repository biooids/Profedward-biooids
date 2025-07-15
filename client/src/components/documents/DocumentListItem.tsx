// src/components/documents/DocumentListItem.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MoreVertical, Edit, Trash2, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Document } from "@/lib/document/documentTypes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DocumentActionModal from "./DocumentActionModal";
import { useDeleteDocumentMutation } from "@/lib/document/documentApiSlice";
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

interface DocumentListItemProps {
  document: Document;
  shelfId: string;
}

export default function DocumentListItem({
  document,
  shelfId,
}: DocumentListItemProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteDocument, { isLoading: isDeleting }] =
    useDeleteDocumentMutation();

  const handleDropdownClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDelete = async () => {
    try {
      await deleteDocument({ documentId: document.id, shelfId }).unwrap();
      setIsDeleteDialogOpen(false);
    } catch (err) {
      console.error("Failed to delete document", err);
    }
  };

  // --- THIS IS THE FIX ---
  const documentType = document.originalFileType ?? "Editable Document";

  return (
    <>
      <Link
        href={`/documents/${shelfId}/${document.id}`}
        className="block border-b last:border-b-0"
      >
        <div className="flex items-center gap-4 p-4 transition-colors hover:bg-muted/50">
          <FileText className="h-6 w-6 flex-shrink-0 text-muted-foreground" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground truncate">
              {document.name}
            </p>
            <p className="text-sm text-muted-foreground">
              {/* Display the correct type here */}
              {documentType} • Uploaded{" "}
              {new Date(document.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div
            className="flex items-center gap-2"
            onClick={handleDropdownClick}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditModalOpen(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  <span>Rename</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Link>

      <DocumentActionModal
        isOpen={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        shelfId={shelfId}
        document={document}
      />
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              document "{document.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
