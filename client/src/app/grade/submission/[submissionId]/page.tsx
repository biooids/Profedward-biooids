// src/app/grade/submission/[submissionId]/page.tsx

import { use } from "react"; // 1. Import the 'use' hook
import GradingWorkspace from "@/components/teacher/GradingWorkspace";

// 2. Define 'params' as a Promise
interface PageProps {
  params: Promise<{
    submissionId: string;
  }>;
}

// 3. The component is a regular (non-async) function
export default function GradeSubmissionPage({ params }: PageProps) {
  // 4. Unwrap the promise to get the resolved params
  const resolvedParams = use(params);

  return <GradingWorkspace submissionId={resolvedParams.submissionId} />;
}

// This line remains unchanged
export const dynamic = "force-dynamic";
