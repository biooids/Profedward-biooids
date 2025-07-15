import React from "react";
import { Progress } from "@/components/ui/progress"; // Assuming you use shadcn/ui
import { Loader2 } from "lucide-react";
import { useGetUserQuotaQuery } from "@/lib/tts/ttsApiSlice";

export default function UserQuotaDisplay() {
  const { data, isLoading, isError, error } = useGetUserQuotaQuery();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading quota...</span>
      </div>
    );
  }

  if (isError) {
    console.error("Failed to load user quota:", error);
    return (
      <div className="text-sm text-destructive">Could not load quota.</div>
    );
  }

  if (!data) {
    return null;
  }

  // --- THIS IS THE FIX ---
  // Updated variable names to match the new generic API response
  const { ttsCharacterUsage, ttsCharacterQuota } = data; // <-- UPDATED

  const remaining = ttsCharacterQuota - ttsCharacterUsage; // <-- UPDATED
  const percentageUsed =
    ttsCharacterQuota > 0 ? (ttsCharacterUsage / ttsCharacterQuota) * 100 : 0; // <-- UPDATED & made safer

  // For formatting large numbers with commas
  const formatNumber = (num: number) => new Intl.NumberFormat().format(num);

  return (
    <div className="flex flex-col gap-2 p-4 border rounded-lg bg-card text-card-foreground">
      <div className="flex justify-between items-center text-sm font-medium">
        <span>Monthly AI Voice Usage </span>
        <span className="font-mono text-muted-foreground">
          {formatNumber(ttsCharacterUsage)} / {formatNumber(ttsCharacterQuota)}
        </span>
      </div>
      <Progress value={percentageUsed} className="w-full" />
      <p className="text-xs text-muted-foreground text-right">
        {formatNumber(remaining > 0 ? remaining : 0)} characters remaining.
      </p>
    </div>
  );
}
