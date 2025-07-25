"use client";

import { useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, UserCog, ShieldCheck, LogOut, Loader2 } from "lucide-react";

// --- CONFIGURE YOUR TEST USERS HERE ---
// Replace with the actual user IDs from your database
const testUsers = [
  {
    name: "Admin",
    userId: "ec843a39-ae94-455c-b9a0-7e61da28f337",
    icon: ShieldCheck,
  },
  {
    name: "Teacher",
    userId: "73f932ec-53db-49cc-b2a4-ffe25ae6e24c",
    icon: UserCog,
  },
  {
    name: "Student",
    userId: "a9167335-20fc-46b6-9e64-6ab9010cb2be",
    icon: User,
  },

  {
    name: "General",
    userId: "89c65bc3-01b9-473c-85bc-9f4e72efb7fc",
    icon: User,
  },
];

export default function DevLoginPanel() {
  const { data: session, status } = useSession();

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // This component will render NOTHING in production
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  const handleDevLogin = async (userId: string) => {
    setIsLoading(true);
    await signIn("credentials", {
      redirect: false,
      action: "dev-login",
      userId,
    });
    router.refresh();
    setIsLoading(false);
  };

  const handleLogout = async () => {
    setIsLoading(true);
    await signOut({ redirect: false });
    router.refresh();
    setIsLoading(false);
  };

  const renderContent = () => {
    if (status === "loading" || isLoading) {
      return (
        <div className="flex justify-center items-center p-2">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (session) {
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Logged in as:</span>
          <Badge variant="outline">{session.user.userRole}</Badge>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-2">
        {testUsers.map((user) => (
          <Button
            key={user.userId}
            variant="outline"
            size="sm"
            onClick={() => handleDevLogin(user.userId)}
          >
            <user.icon className="mr-2 h-4 w-4" />
            Login as {user.name}
          </Button>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-background/80 backdrop-blur-sm border border-border p-3 rounded-lg shadow-lg">
      <h4 className="text-sm font-bold text-center mb-2">Dev Panel</h4>
      {renderContent()}
    </div>
  );
}
