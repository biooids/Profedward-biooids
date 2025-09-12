import { use } from "react"; // 1. Import the 'use' hook
import CreateAssignmentWorkflow from "@/components/teacher/CreateAssignmentWorkflow";
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/layouts/PageHeader";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// 2. Define 'params' as a Promise
interface NewAssignmentPageProps {
  params: Promise<{
    courseId: string;
  }>;
}

// 3. The component remains a regular function
export default function NewAssignmentPage({ params }: NewAssignmentPageProps) {
  // 4. Unwrap the promise to get the resolved params
  const resolvedParams = use(params);

  return (
    <>
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-7 w-7" asChild>
          {/* 5. Use the resolved courseId */}
          <Link href={`/courses/${resolvedParams.courseId}`}>
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
      {/* 5. Use the resolved courseId */}
      <CreateAssignmentWorkflow courseId={resolvedParams.courseId} />
    </>
  );
}
