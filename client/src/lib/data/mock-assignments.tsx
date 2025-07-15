// lib/data/mock-assignments.ts
import { Clock, CheckCircle, Award, RefreshCw, XCircle } from "lucide-react";

export type AssignmentStatus =
  | "Pending"
  | "Submitted"
  | "Graded"
  | "Resubmit"
  | "Cancelled";

export type Assignment = {
  id: string;
  title: string;
  subject: string;
  teacher: string;
  dueDate: string;
  status: AssignmentStatus;
  grade?: string; // e.g., "A-", "88/100"
  feedback?: string;
  rejectionReason?: string;
};

export const mockAssignments: Assignment[] = [
  {
    id: "asg-001",
    title: "Quantum Entanglement Essay",
    subject: "Physics",
    teacher: "Dr. Evelyn Reed",
    dueDate: "2025-06-20T23:59:59Z",
    status: "Pending",
  },
  {
    id: "asg-002",
    title: "Lab Report: Titration Experiment",
    subject: "Chemistry",
    teacher: "Mr. David Chen",
    dueDate: "2025-06-15T23:59:59Z",
    status: "Submitted",
  },
  {
    id: "asg-003",
    title: "Calculus Problem Set 3",
    subject: "Math",
    teacher: "Prof. Maria Garcia",
    dueDate: "2025-06-12T23:59:59Z",
    status: "Graded",
    grade: "95/100",
    feedback:
      "Excellent work on the integration problems! Be mindful of your notation on question 4.",
  },
  {
    id: "asg-004",
    title: "Analysis of 'Hamlet' Act III",
    subject: "Literature",
    teacher: "Dr. Samuel Jones",
    dueDate: "2025-06-18T23:59:59Z",
    status: "Resubmit",
    rejectionReason:
      "Your thesis statement is unclear. Please refine your argument and provide more direct quotes from the text. Resubmit by Friday.",
  },
  {
    id: "asg-005",
    title: "Mid-term Project Proposal",
    subject: "Biology",
    teacher: "Dr. Aisha Khan",
    dueDate: "2025-06-10T23:59:59Z",
    status: "Cancelled",
    rejectionReason:
      "This project has been cancelled due to a curriculum update.",
  },
];

// Helper to get status-specific icons and colors
export const getStatusAppearance = (status: AssignmentStatus) => {
  switch (status) {
    case "Pending":
      return {
        icon: <Clock className="h-4 w-4 text-yellow-600" />,
        color: "text-yellow-600",
        bg: "bg-yellow-100",
      };
    case "Submitted":
      return {
        icon: <CheckCircle className="h-4 w-4 text-green-600" />,
        color: "text-green-600",
        bg: "bg-green-100",
      };
    case "Graded":
      return {
        icon: <Award className="h-4 w-4 text-blue-600" />,
        color: "text-blue-600",
        bg: "bg-blue-100",
      };
    case "Resubmit":
      return {
        icon: <RefreshCw className="h-4 w-4 text-orange-600" />,
        color: "text-orange-600",
        bg: "bg-orange-100",
      };
    case "Cancelled":
      return {
        icon: <XCircle className="h-4 w-4 text-red-600" />,
        color: "text-red-600",
        bg: "bg-red-100",
      };
    default:
      return { icon: <Clock className="h-4 w-4" />, color: "", bg: "bg-muted" };
  }
};
