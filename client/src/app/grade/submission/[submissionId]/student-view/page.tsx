import GradedViewWorkspace from "@/components/student/GradedViewWorkspace";

interface PageProps {
  params: {
    submissionId: string;
  };
}

export default function GradedSubmissionPage({ params }: PageProps) {
  return <GradedViewWorkspace submissionId={params.submissionId} />;
}
