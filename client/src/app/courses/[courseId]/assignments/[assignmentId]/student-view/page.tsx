//src/app/courses/[courseId]/assignments/[assignmentId]/student-view/page.tsx

import StudentAssignmentView from "@/components/student/StudentAssignmentView";

interface PageProps {
  params: {
    assignmentId: string;
  };
}

// This page will now render our new split-screen workspace
export default async function StudentAssignmentDetailPage({
  params,
}: PageProps) {
  return <StudentAssignmentView assignmentId={params.assignmentId} />;
}
