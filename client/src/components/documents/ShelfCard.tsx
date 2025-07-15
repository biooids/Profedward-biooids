// src/components/documents/ShelfCard.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Folder, BookOpen, MoreVertical, Edit, Trash2 } from "lucide-react";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Shelf } from "@/lib/shelf/shelfTypes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import ShelfActionModal from "./ShelfActionModal";

interface ShelfCardProps {
  shelf: Shelf;
}

export default function ShelfCard({ shelf }: ShelfCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDropdownClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const itemCount = shelf._count?.documents ?? 0;

  return (
    <>
      <Card className="flex h-full flex-col transition-all hover:shadow-primary/10 hover:shadow-lg hover:-translate-y-1">
        <Link
          href={`/documents/${shelf.id}`}
          className="flex flex-col flex-grow"
        >
          <CardHeader>
            <div className="flex items-start justify-between">
              <Folder className="h-8 w-8 text-muted-foreground flex-shrink-0" />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 -mt-2 -mr-2"
                    onClick={handleDropdownClick}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" onClick={handleDropdownClick}>
                  <DropdownMenuItem onClick={() => setIsModalOpen(true)}>
                    <Edit className="mr-2 h-4 w-4" />
                    <span>Edit / Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <CardTitle className="pt-4 line-clamp-2">{shelf.name}</CardTitle>
          </CardHeader>
          <CardFooter className="mt-auto flex items-center justify-between pt-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              {/* --- THIS IS THE FIX --- */}
              {/* We now display the real count from the API. */}
              <span>
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </span>
            </div>
            <span>
              Updated {new Date(shelf.createdAt).toLocaleDateString()}
            </span>
          </CardFooter>
        </Link>
      </Card>

      <ShelfActionModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        shelf={shelf}
      />
    </>
  );
}
