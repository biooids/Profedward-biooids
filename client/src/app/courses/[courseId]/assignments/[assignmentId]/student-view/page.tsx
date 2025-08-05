//src/components/student/StudentAssignmentView.tsx
import StudentAssignmentView from "@/components/student/StudentAssignmentView";

// The page now receives both courseId and assignmentId in its params
interface PageProps {
  params: {
    courseId: string;
    assignmentId: string;
  };
}

export default async function StudentAssignmentDetailPage({
  params,
}: PageProps) {
  // We only need to pass the assignmentId to the component
  return <StudentAssignmentView assignmentId={params.assignmentId} />;
}
