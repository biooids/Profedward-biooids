// lib/data/mock-teacher-data.ts
import React from "react";

// --- Types ---
export type Student = {
  id: string;
  name: string;
  avatarUrl: string;
};

export type SubmissionStatus =
  | "Submitted"
  | "Graded"
  | "Not Submitted"
  | "Late";

export type StudentSubmission = {
  student: Student;
  status: SubmissionStatus;
  submittedAt?: string; // e.g., "June 9, 2025"
  grade?: string;
  feedback?: string;
  files?: { name: string; url: string }[];
};

export type TeacherAssignment = {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  submissions: StudentSubmission[];
};

// --- Mock Data ---
export const mockStudents: Student[] = [
  {
    id: "stu-01",
    name: "Alice Johnson",
    avatarUrl: "https://picsum.photos/id/1011/100",
  },
  {
    id: "stu-02",
    name: "Bob Williams",
    avatarUrl: "https://picsum.photos/id/1012/100",
  },
  {
    id: "stu-03",
    name: "Charlie Brown",
    avatarUrl: "https://picsum.photos/id/1013/100",
  },
  {
    id: "stu-04",
    name: "Diana Miller",
    avatarUrl: "https://picsum.photos/id/1014/100",
  },
  {
    id: "stu-05",
    name: "Ethan Davis",
    avatarUrl: "https://picsum.photos/id/1015/100",
  },
  {
    id: "stu-06",
    name: "Fiona Garcia",
    avatarUrl: "https://picsum.photos/id/1016/100",
  },
];

export const mockTeacherAssignments: TeacherAssignment[] = [
  {
    id: "teacher-asg-01",
    title: "Essay: The Ethics of AI",
    subject: "Philosophy",
    dueDate: "2025-06-25T23:59:59Z",
    submissions: [
      {
        student: mockStudents[0],
        status: "Graded",
        submittedAt: "June 8, 2025",
        grade: "A-",
        feedback: "Excellent analysis of the core ethical dilemmas.",
      },
      {
        student: mockStudents[1],
        status: "Submitted",
        submittedAt: "June 9, 2025",
        files: [{ name: "bob_essay.pdf", url: "#" }],
      },
      {
        student: mockStudents[2],
        status: "Submitted",
        submittedAt: "June 10, 2025",
        files: [{ name: "cb_ethics_final.pdf", url: "#" }],
      },
      {
        student: mockStudents[3],
        status: "Late",
        submittedAt: "June 11, 2025",
        files: [{ name: "diana_essay.pdf", url: "#" }],
      },
      { student: mockStudents[4], status: "Not Submitted" },
      {
        student: mockStudents[5],
        status: "Graded",
        submittedAt: "June 7, 2025",
        grade: "B+",
        feedback:
          "Good points, but please elaborate more on the counter-arguments next time.",
      },
    ],
  },
  {
    id: "teacher-asg-02",
    title: "Problem Set #5",
    subject: "Physics",
    dueDate: "2025-07-01T23:59:59Z",
    submissions: mockStudents.map((s) => ({
      student: s,
      status: "Not Submitted",
    })), // All pending
  },
];
