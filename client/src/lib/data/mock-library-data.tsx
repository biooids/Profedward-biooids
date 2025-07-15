// lib/data/mock-library-data.tsx
import React from "react";

export type Book = {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  category: "Physics" | "Chemistry" | "Math" | "Literature" | "Biology";
  type: "Free" | "Rent" | "Buy";
  format: "E-Book" | "Physical";
  availability: "Available" | "Borrowed";
  price?: number;
  dueDate?: string;
};

export const mockLibraryBooks: Book[] = [
  {
    id: "lib-001",
    title: "Fundamentals of Physics",
    author: "Halliday & Resnick",
    coverUrl: "https://picsum.photos/id/24/400/600",
    category: "Physics",
    type: "Rent",
    format: "Physical",
    availability: "Available",
    price: 35.5,
  },
  {
    id: "lib-002",
    title: "Organic Chemistry as a Second Language",
    author: "David R. Klein",
    coverUrl: "https://picsum.photos/id/119/400/600",
    category: "Chemistry",
    type: "Buy",
    format: "E-Book",
    availability: "Available",
    price: 89.99,
  },
  {
    id: "lib-003",
    title: "The Principles of Mathematical Analysis",
    author: "Walter Rudin",
    coverUrl: "https://picsum.photos/id/211/400/600",
    category: "Math",
    type: "Rent",
    format: "Physical",
    availability: "Borrowed",
    dueDate: "2025-07-15",
  },
  {
    id: "lib-004",
    title: "The Double Helix: A Personal Account",
    author: "James D. Watson",
    coverUrl: "https://picsum.photos/id/367/400/600",
    category: "Biology",
    type: "Free",
    format: "E-Book",
    availability: "Available",
  },
  {
    id: "lib-005",
    title: "Hamlet",
    author: "William Shakespeare",
    coverUrl: "https://picsum.photos/id/431/400/600",
    category: "Literature",
    type: "Free",
    format: "E-Book",
    availability: "Available",
  },
];

export const categories = [
  "All",
  ...Array.from(new Set(mockLibraryBooks.map((b) => b.category))),
];
export const formats = ["All Formats", "E-Book", "Physical"];
