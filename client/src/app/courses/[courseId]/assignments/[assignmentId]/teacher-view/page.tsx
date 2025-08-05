//src/app/courses/[courseId]/assignments/[assignmentId]/teacher-view/page.tsx
import TeacherAssignmentView from "@/components/teacher/TeacherAssignmentView";

interface PageProps {
  params: {
    assignmentId: string;
  };
}

// This page now lives at the more specific .../teacher-view route
export default async function TeacherAssignmentDetailPage({
  params,
}: PageProps) {
  return <TeacherAssignmentView assignmentId={params.assignmentId} />;
}
