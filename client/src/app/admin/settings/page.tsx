import AcademicSettingsDashboard from "@/components/admin/AcademicSettingsDashboard";
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/layouts/PageHeader";

export default function AdminSettingsPage() {
  return (
    <>
      <PageHeader>
        <PageHeaderHeading>Academic Settings</PageHeaderHeading>
        <PageHeaderDescription>
          Manage the building blocks for creating new courses, such as grade
          levels and subjects.
        </PageHeaderDescription>
      </PageHeader>
      <AcademicSettingsDashboard />
    </>
  );
}
