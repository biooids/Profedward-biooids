import { use } from "react"; // 1. Import the 'use' hook
import StudentAssignmentView from "@/components/student/StudentAssignmentView";

// 2. Define 'params' as a Promise to satisfy the type error
interface PageProps {
  params: Promise<{
    courseId: string;
    assignmentId: string;
  }>;
}

// 3. The component is a regular (non-async) function
export default function StudentAssignmentDetailPage({ params }: PageProps) {
  // 4. Unwrap the promise to get the resolved params object
  const resolvedParams = use(params);

  return <StudentAssignmentView assignmentId={resolvedParams.assignmentId} />;
}
