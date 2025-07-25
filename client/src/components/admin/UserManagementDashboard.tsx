// src/components/admin/UserManagementDashboard.tsx
"use client";

import { useState, useMemo } from "react";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, BookUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import EnrollStudentModal from "./EnrollStudentModal";
import { toast } from "sonner";

export default function UserManagementDashboard() {
  const { data: users, isLoading, isError } = useGetAllUsersQuery();
  const [updateUserRole] = useUpdateUserRoleMutation();

  const [enrollModalState, setEnrollModalState] = useState<{
    isOpen: boolean;
    student: User | null;
  }>({ isOpen: false, student: null });
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter((user) => {
      const matchesRole = roleFilter === "ALL" || user.userRole === roleFilter;
      const matchesSearch =
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.displayName || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      return matchesRole && matchesSearch;
    });
  }, [users, searchTerm, roleFilter]);

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    const promise = updateUserRole({
      userId,
      data: { role: newRole },
    }).unwrap();
    toast.promise(promise, {
      loading: "Updating role...",
      success: "User role updated successfully!",
      error: (err) => err.data?.message || "Failed to update role.",
    });
  };

  const openEnrollModal = (student: User) =>
    setEnrollModalState({ isOpen: true, student });

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  if (isError || !users)
    return <p className="text-destructive">Failed to load users.</p>;

  return (
    <>
      <EnrollStudentModal
        isOpen={enrollModalState.isOpen}
        onOpenChange={(isOpen) =>
          setEnrollModalState({
            isOpen,
            student: isOpen ? enrollModalState.student : null,
          })
        }
        student={enrollModalState.student}
      />

      <div className="flex items-center gap-4 mb-4">
        <Input
          placeholder="Search by name, username, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by role..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Roles</SelectItem>
            {Object.values(UserRole).map((role) => (
              <SelectItem key={role} value={role}>
                {role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

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
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
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
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

const RoleBadge = ({ role }: { role: UserRole }) => {
  const variant = {
    ADMIN: "destructive",
    TEACHER: "default",
    STUDENT: "secondary",
    GENERAL: "outline",
  }[role] as "default" | "destructive" | "secondary" | "outline";
  return <Badge variant={variant}>{role}</Badge>;
};
