"use client";

import { useSession } from "next-auth/react";
import { UserRole } from "@/lib/user/userTypes";
import TeacherAssignmentsDashboard from "@/components/teacher/AssignmentsDashboard";
import StudentAssignmentsDashboard from "@/components/student/StudentAssignmentsDashboard";
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/layouts/PageHeader";
import { Loader2 } from "lucide-react";

export default function AssignmentsPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const isTeacher = session?.user?.userRole === UserRole.TEACHER;
  const isStudent = session?.user?.userRole === UserRole.STUDENT;

  return (
    <>
      <PageHeader>
        <PageHeaderHeading>Assignments</PageHeaderHeading>
        <PageHeaderDescription>
          {isTeacher
            ? "Review and grade student submissions here."
            : "Track your pending, submitted, and graded assignments."}
        </PageHeaderDescription>
      </PageHeader>

      {isTeacher && <TeacherAssignmentsDashboard />}
      {isStudent && <StudentAssignmentsDashboard />}
    </>
  );
}
