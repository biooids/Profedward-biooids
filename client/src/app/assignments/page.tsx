//src/app/assignments/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { UserRole } from "@/lib/user/userTypes";
import TeacherCoursesForAssignments from "@/components/teacher/TeacherCoursesForAssignments";
import StudentCoursesForAssignments from "@/components/student/StudentCoursesForAssignments";
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/layouts/PageHeader";
import { Loader2 } from "lucide-react";

export default function AssignmentsHubPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const userRole = session?.user?.userRole;

  return (
    <>
      <PageHeader>
        <PageHeaderHeading>Assignments</PageHeaderHeading>
        <PageHeaderDescription>
          Select a course to view its assignments and submissions.
        </PageHeaderDescription>
      </PageHeader>

      {userRole === UserRole.TEACHER && <TeacherCoursesForAssignments />}
      {userRole === UserRole.STUDENT && <StudentCoursesForAssignments />}
    </>
  );
}
