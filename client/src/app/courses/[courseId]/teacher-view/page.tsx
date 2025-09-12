// src/app/courses/[courseId]/teacher-view/page.tsx

import { use } from "react"; // 1. Import the 'use' hook
import TeacherCourseDetailView from "@/components/teacher/TeacherCourseDetailView";

// 2. Define 'params' as a Promise
interface TeacherCourseDetailPageProps {
  params: Promise<{
    courseId: string;
  }>;
}

// 3. The component is a regular (non-async) function
export default function TeacherCourseDetailPage({
  params,
}: TeacherCourseDetailPageProps) {
  // 4. Unwrap the promise to get the resolved params
  const resolvedParams = use(params);

  return <TeacherCourseDetailView courseId={resolvedParams.courseId} />;
}
