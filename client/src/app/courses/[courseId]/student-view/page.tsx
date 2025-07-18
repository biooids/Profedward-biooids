import StudentCourseDetailView from "@/components/student/StudentCourseDetailView";

interface PageProps {
  params: {
    courseId: string;
  };
}

export default async function StudentCourseDetailPage({ params }: PageProps) {
  return <StudentCourseDetailView courseId={params.courseId} />;
}
