import GradingWorkspace from "@/components/teacher/GradingWorkspace";

interface PageProps {
  params: {
    submissionId: string;
  };
}

export default function GradeSubmissionPage({ params }: PageProps) {
  return <GradingWorkspace submissionId={params.submissionId} />;
}

export const dynamic = "force-dynamic";
