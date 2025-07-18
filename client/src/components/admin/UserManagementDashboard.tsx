"use client";

import { useState } from "react";
import {
  useGetAllUsersQuery,
  useUpdateUserRoleMutation,
} from "@/lib/admin/adminApiSlice";
import { User, UserRole } from "@/lib/user/userTypes";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, BookUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import EnrollStudentModal from "./EnrollStudentModal";

export default function UserManagementDashboard() {
  const { data: users, isLoading, isError } = useGetAllUsersQuery();
  const [updateUserRole, { isLoading: isUpdating }] =
    useUpdateUserRoleMutation();

  // --- State to manage the enrollment modal ---
  const [enrollModalState, setEnrollModalState] = useState<{
    isOpen: boolean;
    student: User | null;
  }>({
    isOpen: false,
    student: null,
  });

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    updateUserRole({ userId, data: { role: newRole } });
  };

  const openEnrollModal = (student: User) => {
    setEnrollModalState({ isOpen: true, student });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !users) {
    return <p className="text-destructive">Failed to load users.</p>;
  }

  return (
    <>
      {/* Render the modal, it will be invisible until its state is changed */}
      <EnrollStudentModal
        isOpen={enrollModalState.isOpen}
        onOpenChange={(isOpen) =>
          setEnrollModalState({ isOpen, student: null })
        }
        student={enrollModalState.student}
      />

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={user.profileImage ?? ""} />
                      <AvatarFallback>
                        {user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {user.displayName || user.username}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Select
                    value={user.userRole}
                    onValueChange={(newRole: UserRole) =>
                      handleRoleChange(user.id, newRole)
                    }
                    disabled={isUpdating}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue>
                        <RoleBadge role={user.userRole} />
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(UserRole).map((role) => (
                        <SelectItem key={role} value={role}>
                          <RoleBadge role={role} />
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  {new Date(user.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  {/* --- Conditionally render the "Enroll" button for students --- */}
                  {user.userRole === UserRole.STUDENT && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEnrollModal(user)}
                    >
                      <BookUp className="mr-2 h-4 w-4" />
                      Enroll
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

// Helper component for styling roles
const RoleBadge = ({ role }: { role: UserRole }) => {
  const variant = {
    ADMIN: "destructive",
    TEACHER: "default",
    STUDENT: "secondary",
    GENERAL: "outline",
  }[role] as "default" | "destructive" | "secondary" | "outline";

  return <Badge variant={variant}>{role}</Badge>;
};
