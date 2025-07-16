import AssignmentView from "@/components/teacher/AssignmentView";

interface PageProps {
  params: {
    assignmentId: string;
  };
}

export default async function AssignmentDetailPage({ params }: PageProps) {
  return <AssignmentView assignmentId={params.assignmentId} />;
}
