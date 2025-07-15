// src/components/editor/TiptapEditor.tsx
"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { cn } from "@/lib/utils";
import EditorToolbar from "./EditorToolbar";

interface TiptapEditorProps {
  // eslint-disable-next-line no-unused-vars
  onUpdate?: (content: string) => void;
  initialContent?: any; // Can be string or JSON object
  className?: string;
  hasError?: boolean;
  editable?: boolean; // <-- 1. ADD NEW PROP for read-only mode
}

export default function TiptapEditor({
  onUpdate,
  initialContent = "",
  className,
  hasError,
  editable = true, // Default to editable
}: TiptapEditorProps) {
  const editor = useEditor({
    // --- 2. USE THE NEW PROP ---
    editable: editable,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class:
          "prose dark:prose-invert prose-sm sm:prose-base focus:outline-none p-6 min-h-[300px]",
      },
    },
    onUpdate: ({ editor }) => {
      // Only call onUpdate if it's provided (i.e., in edit mode)
      if (onUpdate) {
        if (editor.isEmpty) {
          onUpdate("");
        } else {
          onUpdate(JSON.stringify(editor.getJSON()));
        }
      }
    },
  });

  return (
    <div
      className={cn(
        "flex flex-col border rounded-md bg-background",
        // Only show focus ring if it's editable
        editable &&
          "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        hasError && "border-destructive ring-destructive",
        className
      )}
    >
      {/* --- 3. Only show the toolbar if the editor is editable --- */}
      {editable && <EditorToolbar editor={editor} />}
      <div className="flex-grow overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
