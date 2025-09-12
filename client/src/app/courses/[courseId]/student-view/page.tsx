// src/app/courses/[courseId]/student-view/page.tsx

import { use } from "react"; // 1. Import the 'use' hook
import StudentCourseDetailView from "@/components/student/StudentCourseDetailView";

// 2. Define 'params' as a Promise
interface PageProps {
  params: Promise<{
    courseId: string;
  }>;
}

// 3. The component is a regular (non-async) function
export default function StudentCourseDetailPage({ params }: PageProps) {
  // 4. Unwrap the promise to get the resolved params
  const resolvedParams = use(params);

  return <StudentCourseDetailView courseId={resolvedParams.courseId} />;
}
