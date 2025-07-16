"use client";

// No longer need useState
import { useGetCourseDetailsForTeacherQuery } from "@/lib/course/courseApiSlice";
import Link from "next/link"; // Import the Link component
import { Loader2, PlusCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/layouts/PageHeader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// We no longer import or use CreateAssignmentModal

interface CourseDetailViewProps {
  courseId: string;
}

export default function CourseDetailView({ courseId }: CourseDetailViewProps) {
  const {
    data: course,
    isLoading,
    isError,
  } = useGetCourseDetailsForTeacherQuery(courseId);

  // The useState for the modal is no longer needed

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !course) {
    return (
      <p className="text-destructive text-center">
        Failed to load course details or course not found.
      </p>
    );
  }

  return (
    <>
      <PageHeader>
        <PageHeaderHeading>
          {course.subject.name}: {course.academicLevel.name}
        </PageHeaderHeading>
        <PageHeaderDescription>
          {course.description || "No description provided."}
        </PageHeaderDescription>
      </PageHeader>

      {/* The modal component is removed from here */}

      <div className="grid gap-8 md:grid-cols-3">
        {/* Main Content: Assignments */}
        <div className="md:col-span-2 space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Assignments</CardTitle>
              {/* This button is now a Link */}
              <Button size="sm" asChild>
                <Link href={`/courses/${courseId}/assignments/new`}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Assignment
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {course.assignments.length > 0 ? (
                // REMOVED the extra outer <div> and .map() loop
                <div className="space-y-2">
                  {course.assignments.map((assignment) => (
                    // Add the 'key' prop to the top-level item in the map
                    <Link
                      key={assignment.id}
                      href={`/courses/${courseId}/assignments/${assignment.id}`}
                    >
                      <div className="flex items-center p-2 rounded-md hover:bg-muted">
                        <FileText className="h-5 w-5 mr-3 text-muted-foreground" />
                        <span className="font-medium">{assignment.title}</span>
                        <span className="ml-auto text-xs text-muted-foreground">
                          Due:{" "}
                          {assignment.dueDate
                            ? new Date(assignment.dueDate).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-center py-8 text-muted-foreground">
                  No assignments have been created for this course yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: Student Roster */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>
                Enrolled Students ({course.students.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {course.students.map((student) => (
                <div key={student.id} className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={student.profileImage ?? ""} />
                    <AvatarFallback>
                      {student.displayName?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{student.displayName}</p>
                    <p className="text-xs text-muted-foreground">
                      {student.email}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
