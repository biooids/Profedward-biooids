import MyCoursesDashboard from "@/components/teacher/MyCoursesDashboard";
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/layouts/PageHeader";

// This page will be seen by a logged-in Teacher or Student
export default function CoursesPage() {
  return (
    <>
      <PageHeader>
        <PageHeaderHeading>My Courses</PageHeaderHeading>
        <PageHeaderDescription>
          Here are all the courses you are currently involved in.
        </PageHeaderDescription>
      </PageHeader>

      <MyCoursesDashboard />
    </>
  );
}
