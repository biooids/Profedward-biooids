"use client";

import { useGetCourseDetailsForTeacherQuery } from "@/lib/course/courseApiSlice";
import { Loader2, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/layouts/PageHeader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CourseDetailViewProps {
  courseId: string;
}

export default function CourseDetailView({ courseId }: CourseDetailViewProps) {
  const { data: course, isLoading } =
    useGetCourseDetailsForTeacherQuery(courseId);

  if (isLoading) {
    return <Loader2 className="h-8 w-8 animate-spin" />;
  }

  if (!course) {
    return <p>Course not found.</p>;
  }

  return (
    <>
      <PageHeader>
        <PageHeaderHeading>{course.title}</PageHeaderHeading>
        <PageHeaderDescription>{course.courseCode}</PageHeaderDescription>
      </PageHeader>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Main Content: Assignments */}
        <div className="md:col-span-2 space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Assignments</CardTitle>
              <Button size="sm">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Assignment
              </Button>
            </CardHeader>
            <CardContent>
              {/* You would map over course.assignments here */}
              {course.assignments.length > 0 ? (
                <ul>
                  {course.assignments.map((a) => (
                    <li key={a.id}>{a.title}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
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
                <div key={student.id} className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={student.profileImage ?? ""} />
                    <AvatarFallback>
                      {student.displayName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{student.displayName}</p>
                    <p className="text-sm text-muted-foreground">
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
