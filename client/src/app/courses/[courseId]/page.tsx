// src/app/courses/[courseId]/page.tsx

import { use } from "react";
import CourseDetailView from "@/components/teacher/TeacherCourseDetailView";

// 2. Define 'params' as a Promise
interface CourseDetailPageProps {
  params: Promise<{
    courseId: string;
  }>;
}

// 3. The component is a regular (non-async) function
export default function CourseDetailPage({ params }: CourseDetailPageProps) {
  // 4. Unwrap the promise to get the resolved params
  const resolvedParams = use(params);

  return <CourseDetailView courseId={resolvedParams.courseId} />;
}
