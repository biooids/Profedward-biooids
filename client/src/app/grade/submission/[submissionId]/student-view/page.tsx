// src/app/grade/submission/[submissionId]/student-view/page.tsx

import { use } from "react";
import GradedViewWorkspace from "@/components/student/GradedViewWorkspace";

interface PageProps {
  params: Promise<{
    submissionId: string;
  }>;
}

export default function GradedSubmissionPage({ params }: PageProps) {
  const resolvedParams = use(params);

  return <GradedViewWorkspace submissionId={resolvedParams.submissionId} />;
}
