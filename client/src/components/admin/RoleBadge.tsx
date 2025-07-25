import { Badge } from "@/components/ui/badge";
import { UserRole } from "@/lib/user/userTypes";

interface RoleBadgeProps {
  role: UserRole;
}

export default function RoleBadge({ role }: RoleBadgeProps) {
  const variant = {
    ADMIN: "destructive",
    TEACHER: "default",
    STUDENT: "secondary",
    GENERAL: "outline",
  }[role] as "default" | "destructive" | "secondary" | "outline";

  return <Badge variant={variant}>{role}</Badge>;
}
