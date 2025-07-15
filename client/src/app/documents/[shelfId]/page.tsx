// app/documents/[shelfId]/page.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  Upload,
  Search,
  Settings,
  LayoutGrid,
  List,
  Loader2,
  AlertTriangle,
  FileText,
  LogIn,
  FilePlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useGetShelvesQuery } from "@/lib/shelf/shelfApiSlice";
import { useGetDocumentsInShelfQuery } from "@/lib/document/documentApiSlice";
import DocumentCard from "@/components/documents/DocumentCard";
import DocumentListItem from "@/components/documents/DocumentListItem";
import ShelfActionModal from "@/components/documents/ShelfActionModal";
import DocumentActionModal from "@/components/documents/DocumentActionModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ShelfDetailPage() {
  const { status } = useSession();
  const params = useParams();
  const shelfId = params.shelfId as string;

  const [layout, setLayout] = useState<"grid" | "list">("list");
  const [isShelfModalOpen, setIsShelfModalOpen] = useState(false);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);

  const {
    data: shelf,
    isLoading: isShelfLoading,
    isError: isShelfError,
  } = useGetShelvesQuery(undefined, {
    skip: status !== "authenticated",
    selectFromResult: ({ data, isLoading, isError }) => ({
      data: data?.find((s) => s.id === shelfId),
      isLoading,
      isError,
    }),
  });

  const {
    data: documents = [],
    isLoading: areDocumentsLoading,
    isError: isDocumentsError,
  } = useGetDocumentsInShelfQuery(shelfId, {
    skip: status !== "authenticated" || !shelfId,
  });

  if (status === "loading" || (status === "authenticated" && isShelfLoading)) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <Card className="w-full max-w-lg mx-auto mt-10">
        <CardHeader>
          <CardTitle className="text-center">Authentication Required</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-4">
            You must be logged in to view this shelf.
          </p>
          <Button asChild>
            <Link href="/auth/login">
              <LogIn className="mr-2 h-4 w-4" />
              Log In
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isShelfError || !shelf) {
    return (
      <div className="text-center text-destructive mt-10">
        <AlertTriangle className="mx-auto h-8 w-8 mb-2" />
        <h3 className="text-xl font-medium">Shelf Not Found</h3>
        <p>This shelf may have been deleted or you may not have access.</p>
        <Button asChild className="mt-4">
          <Link href="/documents">Back to Shelves</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" asChild>
              <Link href="/documents">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                {shelf.name}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href={`/documents/${shelf.id}/new`}>
                <FilePlus className="mr-2 h-4 w-4" />
                New Document
              </Link>
            </Button>
            <Button onClick={() => setIsDocumentModalOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search in this shelf..." className="pl-10" />
          </div>
          <ToggleGroup
            type="single"
            value={layout}
            onValueChange={(value: "grid" | "list") =>
              value && setLayout(value)
            }
          >
            <ToggleGroupItem value="grid" aria-label="Grid view">
              <LayoutGrid className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="List view">
              <List className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
          <Button variant="outline" onClick={() => setIsShelfModalOpen(true)}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
        <div>
          {areDocumentsLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : isDocumentsError ? (
            <div className="text-center text-destructive mt-10">
              <AlertTriangle className="mx-auto h-8 w-8 mb-2" />
              <h3 className="text-xl font-medium">Could not load documents</h3>
            </div>
          ) : documents.length === 0 ? (
            <div className="col-span-full mt-10 text-center border-2 border-dashed rounded-lg p-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="text-xl font-medium mt-4">
                No documents here yet
              </h3>
              <p className="text-muted-foreground">
                Click "New Document" or "Upload" to get started.
              </p>
            </div>
          ) : layout === "grid" ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {documents.map((doc) => (
                <DocumentCard key={doc.id} document={doc} shelfId={shelf.id} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border">
              <div className="flex flex-col">
                {documents.map((doc) => (
                  <DocumentListItem
                    key={doc.id}
                    document={doc}
                    shelfId={shelf.id}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <ShelfActionModal
        isOpen={isShelfModalOpen}
        onOpenChange={setIsShelfModalOpen}
        shelf={shelf}
      />
      <DocumentActionModal
        isOpen={isDocumentModalOpen}
        onOpenChange={setIsDocumentModalOpen}
        shelfId={shelf.id}
      />
    </>
  );
}
