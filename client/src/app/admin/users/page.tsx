//src/app/admin/users/page.tsx
import UserManagementDashboard from "@/components/admin/UserManagementDashboard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AdminUsersPage() {
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            View all users in the system and manage their roles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserManagementDashboard />
        </CardContent>
      </Card>
    </div>
  );
}
