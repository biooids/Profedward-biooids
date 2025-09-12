// src/app/courses/[courseId]/assignments/[assignmentId]/teacher-view/page.tsx

import { use } from "react";
import TeacherAssignmentView from "@/components/teacher/TeacherAssignmentView";

// Define 'params' as a Promise to satisfy the type error
interface PageProps {
  params: Promise<{
    courseId: string;
    assignmentId: string;
  }>;
}

// The component is a regular (non-async) function
export default function TeacherAssignmentDetailPage({ params }: PageProps) {
  // Unwrap the promise to get the resolved params object
  const resolvedParams = use(params);

  return <TeacherAssignmentView assignmentId={resolvedParams.assignmentId} />;
}
