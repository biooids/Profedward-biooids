// lib/data/mock-dashboard-data.ts
import React from "react";

// --- Reusable Types ---
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

export type Submission = {
  studentId: string;
  status: SubmissionStatus;
  grade?: string;
};

export type Assignment = {
  id: string;
  title: string;
  dueDate: string;
  submissions: Submission[];
};

export type TeacherClass = {
  id: string;
  name: string;
  description: string;
  subject: string; // FIX: Added subject field for clarity
  students: Student[];
  assignments: Assignment[];
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
];

export const mockDashboardData: TeacherClass[] = [
  {
    id: "class-phys-11",
    name: "Grade 11 Physics",
    subject: "Physics", // FIX: Added subject data
    description: "Fall 2025 - Period 3",
    students: mockStudents.slice(0, 4),
    assignments: [
      {
        id: "teacher-asg-02",
        title: "Problem Set #5: Kinematics",
        dueDate: "2025-07-01T23:59:59Z",
        submissions: [
          { studentId: "stu-01", status: "Graded", grade: "A" },
          { studentId: "stu-02", status: "Submitted" },
          { studentId: "stu-03", status: "Late" },
          { studentId: "stu-04", status: "Not Submitted" },
        ],
      },
      {
        id: "teacher-asg-03",
        title: "Lab Report: Newton's Laws",
        dueDate: "2025-07-15T23:59:59Z",
        submissions: [],
      },
    ],
  },
  {
    id: "class-chem-ap",
    name: "AP Chemistry",
    subject: "Chemistry", // FIX: Added subject data
    description: "Fall 2025 - Period 5",
    students: [mockStudents[0], mockStudents[4], mockStudents[2]],
    assignments: [
      {
        id: "teacher-asg-04",
        title: "Experiment: Titration",
        dueDate: "2025-06-30T23:59:59Z",
        submissions: [
          { studentId: "stu-01", status: "Submitted" },
          { studentId: "stu-05", status: "Not Submitted" },
          { studentId: "stu-02", status: "Not Submitted" },
        ],
      },
    ],
  },
];
