// src/app/assignments/[courseId]/page.tsx

import { use } from "react"; // 1. Import the 'use' hook
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/authOptions";
import { UserRole } from "@/lib/user/userTypes";
import TeacherAssignmentsDashboard from "@/components/teacher/AssignmentsDashboard";
import StudentAssignmentsDashboard from "@/components/student/StudentAssignmentsDashboard";

// 2. Define the 'params' prop as a Promise to match the error
interface CourseAssignmentsPageProps {
  params: Promise<{
    courseId: string;
  }>;
}

// 3. The component is now a regular (non-async) function
export default function CourseAssignmentsPage({
  params,
}: CourseAssignmentsPageProps) {
  // 4. Unwrap the promises for both params and the session
  const resolvedParams = use(params);
  const session = use(getServerSession(authOptions));

  if (!session?.user) {
    redirect("/auth/login");
  }

  const userRole = session.user.userRole;

  return (
    <>
      {userRole === UserRole.TEACHER && (
        // 5. Use the unwrapped courseId from the resolved params
        <TeacherAssignmentsDashboard courseId={resolvedParams.courseId} />
      )}
      {userRole === UserRole.STUDENT && <StudentAssignmentsDashboard />}
    </>
  );
}
