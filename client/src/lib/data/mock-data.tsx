// lib/data/mock-data.ts
import { FileText, Folder, Book, FileType } from "lucide-react";

export type Document = {
  id: string;
  title: string;
  type: "PDF" | "ePub" | "DOCX" | "Note";
  fileSize: string; // e.g., "12.5 MB"
  uploadedAt: string; // e.g., "June 5, 2025"
  icon: React.ReactNode;
};

export type Shelf = {
  id: string;
  name: string;
  description: string;
  subject: "Physics" | "Chemistry" | "Literature" | "General";
  updatedAt: string; // e.g., "June 7, 2025"
  itemCount: number;
  documents: Document[];
};

export const mockShelves: Shelf[] = [
  {
    id: "quantum-mechanics-101",
    name: "Quantum Mechanics",
    description: "Notes and papers on foundational QM principles.",
    subject: "Physics",
    updatedAt: "June 7, 2025",
    itemCount: 3,
    documents: [
      {
        id: "doc-qm-1",
        title: "Copenhagen Interpretation Explained.pdf",
        type: "PDF",
        fileSize: "8.2 MB",
        uploadedAt: "June 5, 2025",
        icon: <FileText className="h-5 w-5 text-destructive" />,
      },
      {
        id: "doc-qm-2",
        title: "Schrödinger's Cat Paradox.docx",
        type: "DOCX",
        fileSize: "1.5 MB",
        uploadedAt: "June 3, 2025",
        icon: <FileType className="h-5 w-5 text-blue-500" />,
      },
      {
        id: "doc-qm-3",
        title: "Introduction to Quantum Computing.epub",
        type: "ePub",
        fileSize: "22.1 MB",
        uploadedAt: "May 28, 2025",
        icon: <Book className="h-5 w-5 text-green-500" />,
      },
    ],
  },
  {
    id: "organic-chemistry-202",
    name: "Organic Chemistry",
    description: "Reaction mechanisms and synthesis pathways.",
    subject: "Chemistry",
    updatedAt: "June 9, 2025",
    itemCount: 2,
    documents: [
      {
        id: "doc-oc-1",
        title: "SN1 vs. SN2 Reactions.pdf",
        type: "PDF",
        fileSize: "5.4 MB",
        uploadedAt: "June 9, 2025",
        icon: <FileText className="h-5 w-5 text-destructive" />,
      },
      {
        id: "doc-oc-2",
        title: "Notes on Stereoisomers.note",
        type: "Note",
        fileSize: "512 KB",
        uploadedAt: "June 1, 2025",
        icon: <FileType className="h-5 w-5 text-yellow-500" />,
      },
    ],
  },
  {
    id: "shakespearean-literature-301",
    name: "Shakespearean Literature",
    description: "Analysis of tragedies and comedies.",
    subject: "Literature",
    updatedAt: "May 15, 2025",
    itemCount: 1,
    documents: [
      {
        id: "doc-sl-1",
        title: "Themes in Hamlet.pdf",
        type: "PDF",
        fileSize: "2.1 MB",
        uploadedAt: "May 15, 2025",
        icon: <FileText className="h-5 w-5 text-destructive" />,
      },
    ],
  },
];
