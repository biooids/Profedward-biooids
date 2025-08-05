"use client";

import { useGetCourseDetailsForStudentQuery } from "@/lib/course/courseApiSlice";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { formatDistanceToNow, isPast } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Loader2,
  FileText,
  Info,
  Users,
  BookText,
  MessageSquare,
  Link as LinkIcon,
  UserCircle,
  FileUp,
  FilePenLine,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/layouts/PageHeader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SyllabusItem from "@/components/teacher/SyllabusItem";

interface StudentCourseDetailViewProps {
  courseId: string;
}

export default function StudentCourseDetailView({
  courseId,
}: StudentCourseDetailViewProps) {
  const { data: session } = useSession();
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
        Failed to load course details. You may not be enrolled in this course.
      </p>
    );
  }

  const currentUserId = session?.user?.id;
  const primaryTeacher = course.teachers?.[0];

  return (
    <>
      <PageHeader>
        <PageHeaderHeading>
          {course.subject.name}: {course.academicLevel.name}
        </PageHeaderHeading>
        <PageHeaderDescription>
          Welcome to your course overview.
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
          <TabsTrigger value="classmates">
            <Users className="mr-2 h-4 w-4" />
            Classmates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Course Syllabus & Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <div className="grid gap-6 md:grid-cols-2">
                <SyllabusItem
                  icon={UserCircle}
                  title="Your Teacher"
                  isPlaceholder={!primaryTeacher}
                >
                  {primaryTeacher ? (
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={primaryTeacher.profileImage ?? ""} />
                        <AvatarFallback>
                          {primaryTeacher.displayName?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <p className="font-medium text-sm">
                        {primaryTeacher.displayName}
                      </p>
                    </div>
                  ) : (
                    <p>Not specified.</p>
                  )}
                </SyllabusItem>
                <SyllabusItem
                  icon={BookText}
                  title="Description"
                  isPlaceholder={!course.description}
                >
                  <p>{course.description || "No description provided."}</p>
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
              course.resources.length > 0 ? (
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
              ) : (
                <div className="pt-6 border-t">
                  <SyllabusItem
                    icon={LinkIcon}
                    title="Resources & Links"
                    isPlaceholder={true}
                  >
                    <p>No resources have been added for this course.</p>
                  </SyllabusItem>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              {course.assignments && course.assignments.length > 0 ? (
                <div className="space-y-2">
                  {course.assignments.map((assignment) => {
                    const dueDate = assignment.dueDate
                      ? new Date(assignment.dueDate)
                      : null;
                    const isOverdue = dueDate ? isPast(dueDate) : false;
                    const isFileUpload = !!assignment.document?.originalFileUrl;
                    const DocumentIcon = isFileUpload ? FileUp : FilePenLine;

                    return (
                      <Link
                        key={assignment.id}
                        href={`/assignments/${assignment.id}/student-view`}
                        className="block"
                      >
                        <div className="flex items-center p-3 rounded-lg border hover:bg-muted transition-colors">
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
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-center py-8 text-muted-foreground">
                  No assignments have been posted for this course yet.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="classmates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Classmates ({course.students?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {course.students && course.students.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {course.students.map((student) => (
                    <div key={student.id} className="flex items-center gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={student.profileImage ?? ""} />
                        <AvatarFallback>
                          {student.displayName?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm">
                            {student.displayName}
                          </p>
                          {student.id === currentUserId && (
                            <Badge variant="outline">(You)</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {student.email}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-center py-8 text-muted-foreground">
                  No other classmates have enrolled yet.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
