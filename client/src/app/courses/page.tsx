//src/app/courses/page.tsx

"use client";

import { useSession } from "next-auth/react";
import { UserRole } from "@/lib/user/userTypes";
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/layouts/PageHeader";
import TeacherCoursesDashboard from "@/components/teacher/TeacherCoursesDashboard"; // Import teacher dashboard
import StudentCoursesDashboard from "@/components/student/StudentCoursesDashboard"; // Import student dashboard
import { Loader2 } from "lucide-react";

export default function CoursesPage() {
  const { data: session, status } = useSession();

  const renderDashboard = () => {
    if (status === "loading") {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      );
    }

    if (session?.user?.userRole === UserRole.TEACHER) {
      return <TeacherCoursesDashboard />;
    }

    if (session?.user?.userRole === UserRole.STUDENT) {
      return <StudentCoursesDashboard />;
    }

    return (
      <p className="text-muted-foreground text-center py-10">
        No courses to display for your role.
      </p>
    );
  };

  return (
    <>
      <PageHeader>
        <PageHeaderHeading>My Courses</PageHeaderHeading>
        <PageHeaderDescription>
          Here are all the courses you are currently involved in.
        </PageHeaderDescription>
      </PageHeader>

      {renderDashboard()}
    </>
  );
}
