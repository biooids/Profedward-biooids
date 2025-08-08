//src/components/teacher/SyllabusItem.tsx

import { cn } from "@/lib/utils";
import React from "react";

interface SyllabusItemProps {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  isPlaceholder: boolean;
}

export default function SyllabusItem({
  icon: Icon,
  title,
  children,
  isPlaceholder,
}: SyllabusItemProps) {
  return (
    <div className="flex items-start gap-4">
      <Icon className="h-5 w-5 mt-1 text-primary flex-shrink-0" />
      <div>
        <h4 className="font-semibold text-card-foreground">{title}</h4>
        <div
          className={cn(
            "text-sm text-muted-foreground",
            isPlaceholder && "italic"
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
