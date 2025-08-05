//stc/app/courses/[courseId]/page.tsx
import CourseDetailView from "@/components/teacher/TeacherCourseDetailView";

interface CourseDetailPageProps {
  params: {
    courseId: string;
  };
}

export default function CourseDetailPage({ params }: CourseDetailPageProps) {
  return <CourseDetailView courseId={params.courseId} />;
}
