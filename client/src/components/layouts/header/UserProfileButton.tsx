// src/components/layout/UserProfileButton.tsx

"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User, LayoutDashboard, Loader2 } from "lucide-react";

export default function UserProfileButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <Loader2 className="h-6 w-6 animate-spin" />;
  }

  if (status === "unauthenticated") {
    return (
      <Button asChild>
        <Link href="/auth/login">Login</Link>
      </Button>
    );
  }

  const user = session?.user;
  const imageUrl = user?.image;
  const fallbackName = user?.name?.charAt(0) || user?.email?.charAt(0) || "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="icon" className="rounded-full">
          <Avatar className="h-8 w-8">
            {/* THE FIX IS HERE:
              Add a `key` prop to the Image component. When `imageUrl` changes,
              the key changes, forcing React to re-mount the component and
              fetch the new image, bypassing the cache.
            */}
            <AvatarImage
              key={imageUrl}
              src={imageUrl!}
              alt={user?.name ?? "User avatar"}
            />
            <AvatarFallback>{fallbackName.toUpperCase()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
