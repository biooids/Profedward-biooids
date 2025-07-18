import StudentSubmissionWorkspace from "@/components/student/StudentSubmissionWorkspace";

interface PageProps {
  params: {
    submissionId: string;
  };
}

export default async function SubmissionPage({ params }: PageProps) {
  return <StudentSubmissionWorkspace submissionId={params.submissionId} />;
}
