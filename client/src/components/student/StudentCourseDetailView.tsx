"use client";

import { useGetCourseDetailsForStudentQuery } from "@/lib/course/courseApiSlice";
import { Loader2, FileText } from "lucide-react";
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/layouts/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function StudentCourseDetailView({
  courseId,
}: {
  courseId: string;
}) {
  const {
    data: course,
    isLoading,
    isError,
  } = useGetCourseDetailsForStudentQuery(courseId);

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
        Failed to load course details.
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

      <div className="grid gap-8 md:grid-cols-3">
        {/* Main Content: Assignments */}
        <div className="md:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Assignments for this Course</CardTitle>
            </CardHeader>
            <CardContent>
              {course.assignments.length > 0 ? (
                <div className="space-y-2">
                  {course.assignments.map((assignment) => (
                    // NOTE: This currently does not link anywhere. The student's main
                    // "Assignments" dashboard is used to track and submit work.
                    <div
                      key={assignment.id}
                      className="flex items-center p-2 rounded-md"
                    >
                      <FileText className="h-5 w-5 mr-3 text-muted-foreground" />
                      <span className="font-medium">{assignment.title}</span>
                      <span className="ml-auto text-xs text-muted-foreground">
                        Due:{" "}
                        {assignment.dueDate
                          ? new Date(assignment.dueDate).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-center py-8 text-muted-foreground">
                  No assignments have been posted for this course yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: Teacher Info */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Your Teacher</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {course.teachers.map((teacher) => (
                <div key={teacher.id} className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={teacher.profileImage ?? ""} />
                    <AvatarFallback>
                      {teacher.displayName?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{teacher.displayName}</p>
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
