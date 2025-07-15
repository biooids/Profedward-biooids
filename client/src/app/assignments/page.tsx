import AssignmentsDashboard from "@/components/teacher/AssignmentsDashboard";
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/layouts/PageHeader";

export default function AssignmentsPage() {
  return (
    <>
      <PageHeader>
        <PageHeaderHeading>Assignments Dashboard</PageHeaderHeading>
        <PageHeaderDescription>
          Review and grade student submissions here.
        </PageHeaderDescription>
      </PageHeader>
      <AssignmentsDashboard />
    </>
  );
}
