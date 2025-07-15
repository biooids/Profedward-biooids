// app/documents/page.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Plus, Search, Loader2, AlertTriangle, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetShelvesQuery } from "@/lib/shelf/shelfApiSlice";
import ShelfCard from "@/components/documents/ShelfCard";
import ShelfActionModal from "@/components/documents/ShelfActionModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DocumentsPage() {
  const { status } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // --- THE FIX: Only fetch data if the user is authenticated ---
  const {
    data: shelves = [],
    isLoading,
    isError,
  } = useGetShelvesQuery(undefined, {
    skip: status !== "authenticated",
  });

  const filteredShelves = shelves.filter((shelf) =>
    shelf.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNewShelf = () => {
    setIsModalOpen(true);
  };

  // --- Render states based on authentication status ---
  if (status === "loading") {
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
            You must be logged in to view your document shelves.
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

  return (
    <>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Document Shelves
            </h1>
            <p className="mt-1 text-muted-foreground">
              Organize your academic life by creating shelves for your courses.
            </p>
          </div>
          <Button onClick={handleNewShelf}>
            <Plus className="mr-2 h-4 w-4" />
            New Shelf
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search shelves..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Shelves Grid */}
        <div>
          {isLoading && (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          {isError && (
            <div className="col-span-full mt-10 text-center text-destructive">
              <AlertTriangle className="mx-auto h-8 w-8 mb-2" />
              <h3 className="text-xl font-medium">Failed to load shelves</h3>
              <p>Please try refreshing the page.</p>
            </div>
          )}
          {!isLoading && !isError && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredShelves.map((shelf) => (
                <ShelfCard key={shelf.id} shelf={shelf} />
              ))}
            </div>
          )}
          {!isLoading && filteredShelves.length === 0 && shelves.length > 0 && (
            <div className="col-span-full mt-10 text-center">
              <h3 className="text-xl font-medium">No shelves found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search term.
              </p>
            </div>
          )}
        </div>
      </div>
      <ShelfActionModal isOpen={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  );
}
