//src/components/teacher/TeacherCourseDetailView.tsx
"use client";

import { useState } from "react";
import { formatDistanceToNow, isPast } from "date-fns";
import { useGetCourseDetailsForTeacherQuery } from "@/lib/course/courseApiSlice";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  Loader2,
  PlusCircle,
  FileText,
  Edit,
  Info,
  Users,
  BookText,
  MessageSquare,
  Link as LinkIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/layouts/PageHeader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EditSyllabusModal from "./EditSyllabusModal";
import SyllabusItem from "./SyllabusItem"; // Import the new component
import { FileUp, FilePenLine } from "lucide-react";

interface CourseDetailViewProps {
  courseId: string;
}

export default function TeacherCourseDetailView({
  courseId,
}: CourseDetailViewProps) {
  const {
    data: course,
    isLoading,
    isError,
  } = useGetCourseDetailsForTeacherQuery(courseId);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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
      <EditSyllabusModal
        course={course}
        isOpen={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
      />

      <PageHeader>
        <PageHeaderHeading>
          {course.subject.name}: {course.academicLevel.name}
        </PageHeaderHeading>
        <PageHeaderDescription>
          Welcome, {course.teachers?.[0]?.displayName || "Teacher"}. Manage your
          course here.
        </PageHeaderDescription>
      </PageHeader>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">
            <Info className="mr-2 h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="assignments">
            <FileText className="mr-2 h-4 w-4" />
            Assignments
          </TabsTrigger>
          <TabsTrigger value="students">
            <Users className="mr-2 h-4 w-4" />
            Students
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: Overview & Syllabus (IMPROVED UI) */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Course Syllabus & Details</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditModalOpen(true)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Details
              </Button>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <div className="grid gap-6 md:grid-cols-2">
                <SyllabusItem
                  icon={BookText}
                  title="Description"
                  isPlaceholder={!course.description}
                >
                  <p>{course.description || "Not specified."}</p>
                </SyllabusItem>

                <SyllabusItem
                  icon={Users}
                  title="Teaching Methodology"
                  isPlaceholder={!course.teacherMethodology}
                >
                  <p>{course.teacherMethodology || "Not specified."}</p>
                </SyllabusItem>

                <SyllabusItem
                  icon={MessageSquare}
                  title="Contact & Office Hours"
                  isPlaceholder={!course.teacherContactInfo}
                >
                  <p>{course.teacherContactInfo || "Not specified."}</p>
                </SyllabusItem>
              </div>

              {Array.isArray(course.resources) &&
                course.resources.length > 0 && (
                  <div className="space-y-4 pt-6 border-t">
                    <h4 className="font-semibold text-card-foreground flex items-center">
                      <LinkIcon className="h-5 w-5 mr-3 text-primary" />
                      Resources & Links
                    </h4>
                    <ul className="list-disc pl-5 space-y-2 text-sm">
                      {course.resources.map((resource: any, index: number) => (
                        <li key={index}>
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary underline-offset-4 hover:underline"
                          >
                            {resource.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: Assignments */}
        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Assignments</CardTitle>
              <Button size="sm" asChild>
                <Link href={`/courses/${courseId}/assignments/new`}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Assignment
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {course.assignments.length > 0 ? (
                <div className="space-y-2">
                  {course.assignments.map((assignment) => {
                    const dueDate = assignment.dueDate
                      ? new Date(assignment.dueDate)
                      : null;
                    const isOverdue = dueDate ? isPast(dueDate) : false;
                    const submissionCount = assignment._count?.submissions || 0;
                    const totalStudents = course.students.length;

                    const isFileUpload = !!assignment.document?.originalFileUrl;
                    const DocumentIcon = isFileUpload ? FileUp : FilePenLine;

                    return (
                      <Link
                        key={assignment.id}
                        href={`/courses/${courseId}/assignments/${assignment.id}`}
                        className="block"
                      >
                        <div className="flex items-center p-3 rounded-lg border hover:bg-muted transition-colors">
                          {/* Use the dynamic icon */}
                          <DocumentIcon className="h-5 w-5 mr-4 text-primary" />

                          <div className="flex-1">
                            <p className="font-semibold">{assignment.title}</p>
                            <p
                              className={cn(
                                "text-xs",
                                isOverdue
                                  ? "text-destructive"
                                  : "text-muted-foreground"
                              )}
                            >
                              {dueDate
                                ? `Due ${formatDistanceToNow(dueDate, {
                                    addSuffix: true,
                                  })}`
                                : "No due date"}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-sm">
                              {submissionCount} / {totalStudents}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Submitted
                            </p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-center py-8 text-muted-foreground">
                  No assignments created yet.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: Students */}
        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                Enrolled Students ({course.students.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {course.students.map((student) => (
                <div key={student.id} className="flex items-center gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={student.profileImage ?? ""} />
                    <AvatarFallback>
                      {student.displayName?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm">
                      {student.displayName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {student.email}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
