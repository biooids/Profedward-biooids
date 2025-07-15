// src/components/documents/DocumentCard.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MoreVertical, Edit, Trash2, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Document } from "@/lib/document/documentTypes";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import DocumentActionModal from "./DocumentActionModal";
import { useDeleteDocumentMutation } from "@/lib/document/documentApiSlice";

interface DocumentCardProps {
  document: Document;
  shelfId: string;
}

export default function DocumentCard({ document, shelfId }: DocumentCardProps) {
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
      <Card className="flex h-full flex-col transition-all hover:shadow-md hover:-translate-y-0.5 relative">
        <Link
          href={`/documents/${shelfId}/${document.id}`}
          className="flex flex-col flex-grow"
        >
          <CardHeader className="flex-row items-center gap-4 space-y-0">
            <div className="flex-shrink-0">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base line-clamp-2 truncate">
                {document.name}
              </CardTitle>
            </div>
          </CardHeader>
          <CardFooter className="mt-auto flex items-center justify-between pt-4 text-xs text-muted-foreground">
            {/* Using the real data properties now */}
            <span className="truncate">{documentType}</span>
            <span>{new Date(document.createdAt).toLocaleDateString()}</span>
          </CardFooter>
        </Link>
        {/* Actions are placed outside the Link to be clickable */}
        <div className="absolute top-2 right-2" onClick={handleDropdownClick}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
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
      </Card>

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
              This will permanently delete the document "{document.name}".
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
