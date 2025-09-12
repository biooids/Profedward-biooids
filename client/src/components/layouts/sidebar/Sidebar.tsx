"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Book,
  Home,
  CheckSquare,
  Users,
  Settings,
  BookOpen,
  File,
  User,
  LucideProps,
} from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";
import { UserRole } from "@/lib/user/userTypes";

type NavLink = {
  href: string;
  label: string;
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
};

const navConfig: Record<UserRole, NavLink[]> = {
  [UserRole.GENERAL]: [
    { href: "/", label: "Home", icon: Home },
    { href: "/documents", label: "My Documents", icon: File },
  ],
  [UserRole.STUDENT]: [
    { href: "/", label: "Home", icon: Home },
    { href: "/documents", label: "My Documents", icon: File },
    { href: "/courses", label: "My Courses", icon: BookOpen },
    { href: "/assignments", label: "Assignments", icon: CheckSquare },
  ],
  [UserRole.TEACHER]: [
    { href: "/", label: "Home", icon: Home },
    { href: "/documents", label: "My Documents", icon: File },
    { href: "/courses", label: "My Courses", icon: BookOpen },
    { href: "/assignments", label: "Assignments", icon: CheckSquare },
  ],
  [UserRole.ADMIN]: [
    { href: "/", label: "Home", icon: Home },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/courses", label: "Courses", icon: BookOpen },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ],
};

const commonLinks: NavLink[] = [
  { href: "/profile", label: "Profile", icon: User },
];

const SidebarNav = () => {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="grid items-start p-4 text-sm font-medium">
        <Skeleton className="h-8 w-full mb-2" />
        <Skeleton className="h-8 w-full mb-2" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  const role: UserRole = session?.user?.userRole ?? UserRole.GENERAL;

  const navLinks = navConfig[role];

  return (
    <nav className="grid items-start p-4 text-sm font-medium">
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
            pathname === link.href && "bg-muted text-primary"
          )}
        >
          <link.icon className="h-4 w-4" />
          {link.label}
        </Link>
      ))}

      <Separator className="my-4" />

      {commonLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
            pathname === link.href && "bg-muted text-primary"
          )}
        >
          <link.icon className="h-4 w-4" />
          {link.label}
        </Link>
      ))}
    </nav>
  );
};

export default function Sidebar() {
  return (
    <aside className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Book className="h-6 w-6" />
            <span>EduPlatform</span>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto">
          <SidebarNav />
        </div>
      </div>
    </aside>
  );
}
