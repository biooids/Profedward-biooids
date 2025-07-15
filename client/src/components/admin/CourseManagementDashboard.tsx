"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useCreateCourseMutation,
  useGetCoursesQuery,
} from "@/lib/course/courseApiSlice";
import { useGetAllUsersQuery } from "@/lib/admin/adminApiSlice";
import {
  useGetAcademicLevelsQuery,
  useGetSubjectsQuery,
} from "@/lib/academic/academicApiSlice";
import { UserRole } from "@/lib/user/userTypes";
import { Course, CreateCourseDto } from "@/lib/course/courseTypes";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";

// Updated Zod schema for the new course structure
const createCourseSchema = z.object({
  academicLevelId: z.string().min(1, "You must select an academic level."),
  subjectId: z.string().min(1, "You must select a subject."),
  teacherId: z.string().min(1, "You must select a teacher."),
  description: z.string().optional(),
});

type CreateCourseFormValues = z.infer<typeof createCourseSchema>;

// Helper function to group courses for an organized display
const groupCoursesByLevel = (courses: Course[]) => {
  return courses.reduce((acc, course) => {
    const levelName = course.academicLevel.name;
    (acc[levelName] = acc[levelName] || []).push(course);
    return acc;
  }, {} as Record<string, Course[]>);
};

export default function CourseManagementDashboard() {
  // --- Data Fetching ---
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
    defaultValues: {
      academicLevelId: "",
      subjectId: "",
      teacherId: "",
      description: "",
    },
  });

  const teachers = users.filter((user) => user.userRole === UserRole.TEACHER);
  const groupedCourses = groupCoursesByLevel(courses);

  const onSubmit = async (data: CreateCourseFormValues) => {
    try {
      await createCourse(data).unwrap();
      reset();
    } catch (err) {
      console.error("Failed to create course:", err);
    }
  };

  return (
    <div className="grid gap-8 md:grid-cols-3">
      {/* Create Course Form Section */}
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Create New Course</CardTitle>
            <CardDescription>
              Combine a level, subject, and teacher to create a new course
              instance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a teacher..." />
                      </SelectTrigger>
                      <SelectContent>
                        {teachers.map((teacher) => (
                          <SelectItem key={teacher.id} value={teacher.id}>
                            {teacher.displayName || teacher.username}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                    <Textarea
                      placeholder="A brief description of the course..."
                      {...field}
                    />
                  </div>
                )}
              />

              <Button type="submit" disabled={isCreating} className="w-full">
                {isCreating && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Course
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Existing Courses List Section */}
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
                    <div className="grid gap-4">
                      {coursesInLevel.map((course) => (
                        <Card key={course.id}>
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
                      ))}
                    </div>
                  </div>
                )
              )
            ) : (
              <p className="text-muted-foreground text-center py-10">
                No courses have been created yet.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
