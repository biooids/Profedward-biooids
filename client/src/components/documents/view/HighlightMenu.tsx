"use client";

import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Languages,
  ClipboardCheck,
  Speaker, // 1. Import the Speaker icon
} from "lucide-react";
import { AiAction } from "./DocumentWorkspace";

// 2. Create a new, more general type for all possible actions from this menu
export type HighlightAction = AiAction | "read_aloud";

interface HighlightMenuProps {
  position: { top: number; left: number };
  // 3. Use the more generic onAction prop
  onAction: (action: HighlightAction) => void;
}

export default function HighlightMenu({
  position,
  onAction,
}: HighlightMenuProps) {
  const menuStyle: React.CSSProperties = {
    position: "absolute",
    top: `${position.top}px`,
    left: `${position.left}px`,
    transform: "translateX(-50%)", // Center the menu horizontally
    zIndex: 10, // Ensure it appears above the content
  };

  return (
    <div
      style={menuStyle}
      className="flex gap-1 rounded-full border bg-card p-1 shadow-lg backdrop-blur-sm"
    >
      <Button
        variant="ghost"
        size="sm"
        className="rounded-full"
        onClick={() => onAction("summarize")}
      >
        <Sparkles className="mr-2 h-4 w-4" /> Summarize
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="rounded-full"
        onClick={() => onAction("explain")}
      >
        <Languages className="mr-2 h-4 w-4" /> Explain
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="rounded-full"
        onClick={() => onAction("quiz")}
      >
        <ClipboardCheck className="mr-2 h-4 w-4" /> Quiz Me
      </Button>

      {/* 4. Add the new "Read Aloud" button */}
      <Button
        variant="ghost"
        size="sm"
        className="rounded-full text-primary hover:text-primary"
        onClick={() => onAction("read_aloud")}
      >
        <Speaker className="mr-2 h-4 w-4" /> Read Aloud
      </Button>
    </div>
  );
}
