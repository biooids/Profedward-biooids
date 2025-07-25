//src/app/courses/[courseId]/teacher-view/page.tsx
import CourseDetailView from "@/components/teacher/CourseDetailView";

interface TeacherCourseDetailPageProps {
  params: { courseId: string };
}

// Add 'async' to the function definition
export default async function TeacherCourseDetailPage({
  params,
}: TeacherCourseDetailPageProps) {
  return <CourseDetailView courseId={params.courseId} />;
}
