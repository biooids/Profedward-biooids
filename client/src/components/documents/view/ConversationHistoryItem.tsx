// src/components/documents/view/ConversationHistoryItem.tsx
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, Trash2, Loader2 } from "lucide-react";
import { ConversationHistoryItem as HistoryItem } from "@/lib/ai/aiTypes";
import { useDeleteConversationMutation } from "@/lib/ai/aiApiSlice";
import { cn } from "@/lib/utils";

interface ConversationHistoryItemProps {
  item: HistoryItem;
  isActive: boolean;
  onSelect: (id: string) => void;
}

export default function ConversationHistoryItem({
  item,
  isActive,
  onSelect,
}: ConversationHistoryItemProps) {
  const [deleteConversation, { isLoading: isDeleting }] =
    useDeleteConversationMutation();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the item from being selected when deleting
    if (isDeleting) return;
    deleteConversation(item.id);
  };

  return (
    <div
      onClick={() => onSelect(item.id)}
      className={cn(
        "flex items-center justify-between gap-2 p-2 rounded-md cursor-pointer transition-colors",
        isActive ? "bg-primary/10" : "hover:bg-muted"
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <MessageSquare className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{item.name}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(item.updatedAt).toLocaleString()}
          </p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 flex-shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        onClick={handleDelete}
        disabled={isDeleting}
        aria-label="Delete conversation"
      >
        {isDeleting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
