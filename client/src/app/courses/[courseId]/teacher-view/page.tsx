//src/app/courses/[courseId]/teacher-view/page.tsx
import TeacherCourseDetailView from "@/components/teacher/TeacherCourseDetailView";

interface TeacherCourseDetailPageProps {
  params: { courseId: string };
}

// Add 'async' to the function definition
export default async function TeacherCourseDetailPage({
  params,
}: TeacherCourseDetailPageProps) {
  return <TeacherCourseDetailView courseId={params.courseId} />;
}
