import CreateAssignmentWorkflow from "@/components/teacher/CreateAssignmentWorkflow";
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/layouts/PageHeader";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface NewAssignmentPageProps {
  params: {
    courseId: string;
  };
}

export default function NewAssignmentPage({ params }: NewAssignmentPageProps) {
  return (
    <>
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-7 w-7" asChild>
          <Link href={`/courses/${params.courseId}`}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <PageHeader className="flex-1 p-0 border-none">
          <PageHeaderHeading>Create New Assignment</PageHeaderHeading>
          <PageHeaderDescription>
            Follow the steps to create and publish a new assignment for your
            course.
          </PageHeaderDescription>
        </PageHeader>
      </div>
      <CreateAssignmentWorkflow courseId={params.courseId} />
    </>
  );
}
