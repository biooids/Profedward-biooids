// src/components/admin/CourseManagementDashboard.tsx
"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { toast } from "sonner";
import {
  useCreateCourseMutation,
  useGetCoursesQuery,
} from "@/lib/course/courseApiSlice";
import { useGetAllUsersQuery } from "@/lib/admin/adminApiSlice";
import {
  useGetAcademicLevelsQuery,
  useGetSubjectsQuery,
} from "@/lib/academic/academicApiSlice";
import { User, UserRole } from "@/lib/user/userTypes";
import { Course } from "@/lib/course/courseTypes";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import TeacherCombobox from "./TeacherCombobox"; // Import the new component
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const createCourseSchema = z.object({
  academicLevelId: z.string().min(1, "You must select an academic level."),
  subjectId: z.string().min(1, "You must select a subject."),
  teacherId: z.string().min(1, "You must select a teacher."),
  description: z.string().optional(),
});
type CreateCourseFormValues = z.infer<typeof createCourseSchema>;

const groupCoursesByLevel = (courses: Course[]) => {
  return courses.reduce((acc, course) => {
    const levelName = course.academicLevel.name;
    (acc[levelName] = acc[levelName] || []).push(course);
    return acc;
  }, {} as Record<string, Course[]>);
};

export default function CourseManagementDashboard() {
  const { data: users = [] } = useGetAllUsersQuery();
  const { data: courses = [], isLoading: isLoadingCourses } =
    useGetCoursesQuery();
  const { data: academicLevels = [] } = useGetAcademicLevelsQuery();
  const { data: subjects = [] } = useGetSubjectsQuery();
  const [createCourse, { isLoading: isCreating }] = useCreateCourseMutation();

  const {
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<CreateCourseFormValues>({
    resolver: zodResolver(createCourseSchema),
  });

  const teachers = users.filter((user) => user.userRole === UserRole.TEACHER);
  const groupedCourses = groupCoursesByLevel(courses);

  const canCreateCourse =
    academicLevels.length > 0 && subjects.length > 0 && teachers.length > 0;

  const onSubmit = async (data: CreateCourseFormValues) => {
    const promise = createCourse(data).unwrap();
    toast.promise(promise, {
      loading: "Creating course...",
      success: () => {
        reset();
        return "Course created successfully!";
      },
      error: (err) => err.data?.message || "Failed to create course.",
    });
  };

  return (
    <div className="grid gap-8 md:grid-cols-3">
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Create New Course</CardTitle>
            <CardDescription>
              Combine a level, subject, and teacher to create a course.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!canCreateCourse && (
              <div className="p-4 text-center text-sm text-muted-foreground bg-muted rounded-md">
                <p>
                  You must create at least one Academic Level, Subject, and
                  assign a Teacher role to a user before you can create a
                  course.
                </p>
              </div>
            )}
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4"
              style={{ display: canCreateCourse ? "block" : "none" }}
            >
              <Controller
                name="academicLevelId"
                control={control}
                render={({ field }) => (
                  <div className="space-y-1.5">
                    <Label>Academic Level</Label>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a level..." />
                      </SelectTrigger>
                      <SelectContent>
                        {academicLevels.map((level) => (
                          <SelectItem key={level.id} value={level.id}>
                            {level.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.academicLevelId && (
                      <p className="text-sm text-destructive">
                        {errors.academicLevelId.message}
                      </p>
                    )}
                  </div>
                )}
              />
              <Controller
                name="subjectId"
                control={control}
                render={({ field }) => (
                  <div className="space-y-1.5">
                    <Label>Subject</Label>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a subject..." />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.subjectId && (
                      <p className="text-sm text-destructive">
                        {errors.subjectId.message}
                      </p>
                    )}
                  </div>
                )}
              />
              <Controller
                name="teacherId"
                control={control}
                render={({ field }) => (
                  <div className="space-y-1.5">
                    <Label>Assign Teacher</Label>
                    <TeacherCombobox
                      teachers={teachers}
                      value={field.value}
                      onChange={field.onChange}
                    />
                    {errors.teacherId && (
                      <p className="text-sm text-destructive">
                        {errors.teacherId.message}
                      </p>
                    )}
                  </div>
                )}
              />
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <div className="space-y-1.5">
                    <Label>Description (Optional)</Label>
                    <Textarea placeholder="A brief description..." {...field} />
                  </div>
                )}
              />
              <Button
                type="submit"
                disabled={isCreating || !canCreateCourse}
                className="w-full"
              >
                {isCreating && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Course
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-2">
        <h2 className="text-2xl font-bold mb-4">Existing Courses</h2>
        {isLoadingCourses ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6">
            {Object.keys(groupedCourses).length > 0 ? (
              Object.entries(groupedCourses).map(
                ([levelName, coursesInLevel]) => (
                  <div key={levelName}>
                    <h3 className="text-lg font-semibold mb-3 border-b pb-2">
                      {levelName}
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {coursesInLevel.map((course) => (
                        <Link
                          key={course.id}
                          href={`/admin/courses/${course.id}`}
                          className="block"
                        >
                          <Card className="hover:border-primary transition-colors">
                            <CardHeader>
                              <CardTitle>{course.subject.name}</CardTitle>
                              <CardDescription>
                                Taught by{" "}
                                {course.teachers[0]?.displayName || "N/A"}
                              </CardDescription>
                            </CardHeader>
                            <CardFooter>
                              <p className="text-sm text-muted-foreground">
                                {course._count.students} Students Enrolled
                              </p>
                            </CardFooter>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </div>
                )
              )
            ) : (
              <p className="text-muted-foreground text-center py-10">
                No courses created yet.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
