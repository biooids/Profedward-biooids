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
    userId: "70da6190-bdc5-4f1c-909b-1b0041b35fad",
    icon: ShieldCheck,
  },
  {
    name: "Teacher",
    userId: "665a4ead-3b03-4de3-ac0c-8af9321eca81",
    icon: UserCog,
  },
  {
    name: "Student",
    userId: "166f30d0-7369-48f7-9672-cbdb1e4f87dd",
    icon: User,
  },

  {
    name: "General",
    userId: "41b1747b-cf77-45a2-aaaf-3bb08be9222b",
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
