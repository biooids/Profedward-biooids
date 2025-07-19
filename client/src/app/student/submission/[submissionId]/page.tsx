import StudentSubmissionWorkspace from "@/components/student/StudentSubmissionWorkspace";

interface PageProps {
  params: {
    submissionId: string;
  };
}

// This page was designed in a previous step and is now being used correctly.
export default async function SubmissionPage({ params }: PageProps) {
  return <StudentSubmissionWorkspace submissionId={params.submissionId} />;
}
