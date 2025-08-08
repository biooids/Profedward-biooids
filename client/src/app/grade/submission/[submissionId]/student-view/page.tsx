//src/app/grade/submission/[submissionId]/student-view/page.tsx

import GradedViewWorkspace from "@/components/student/GradedViewWorkspace";

interface PageProps {
  params: {
    submissionId: string;
  };
}

export default function GradedSubmissionPage({ params }: PageProps) {
  return <GradedViewWorkspace submissionId={params.submissionId} />;
}
