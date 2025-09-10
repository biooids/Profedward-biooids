//src/app/assignments/[courseId]/page.tsx

"use client";

import { useSession } from "next-auth/react";
import { UserRole } from "@/lib/user/userTypes";
import TeacherAssignmentsDashboard from "@/components/teacher/AssignmentsDashboard";
import StudentAssignmentsDashboard from "@/components/student/StudentAssignmentsDashboard";

interface PageProps {
  params: { courseId: string };
}

export default function CourseAssignmentsPage({ params }: PageProps) {
  const { data: session } = useSession();
  const userRole = session?.user?.userRole;

  return (
    <>
      {/* The PageHeader can be moved here from the dashboard components if desired */}
      {userRole === UserRole.TEACHER && (
        <TeacherAssignmentsDashboard courseId={params.courseId} />
      )}
      {userRole === UserRole.STUDENT && <StudentAssignmentsDashboard />}
    </>
  );
}
