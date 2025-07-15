// src/components/documents/view/DocumentViewer.tsx
"use client";

import React from "react";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import TiptapEditor from "@/components/editor/TiptapEditor";

// --- Props are updated to accept both URL and editable content ---
interface DocumentViewerProps {
  documentUrl: string | null;
  editableContent: any | null; // Can be JSON from the database
}

export default function DocumentViewer({
  documentUrl,
  editableContent,
}: DocumentViewerProps) {
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  // --- RENDER LOGIC ---
  // Priority 1: If there's a PDF URL, show the PDF viewer.
  if (documentUrl) {
    return (
      <div
        className="flex-1 overflow-hidden"
        style={{ height: "calc(100vh - 89px)" }}
      >
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
          <Viewer
            fileUrl={documentUrl}
            plugins={[defaultLayoutPluginInstance]}
          />
        </Worker>
      </div>
    );
  }

  // Priority 2: If there's no URL but there IS editable content, show it in a read-only editor.
  if (editableContent) {
    return (
      <div className="flex-1 overflow-y-auto">
        <TiptapEditor
          initialContent={editableContent}
          editable={false} // Set to read-only mode
        />
      </div>
    );
  }

  // Fallback: If there's neither a URL nor editable content, show an error/empty state.
  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8">
      <div className="prose dark:prose-invert max-w-none">
        <h2>Document Content Not Available</h2>
        <p>This document appears to be empty or could not be loaded.</p>
      </div>
    </div>
  );
}
