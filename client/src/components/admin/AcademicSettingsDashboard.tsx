"use client";

import {
  useGetAcademicLevelsQuery,
  useCreateAcademicLevelMutation,
} from "@/lib/academic/academicApiSlice";
import {
  useGetSubjectsQuery,
  useCreateSubjectMutation,
} from "@/lib/academic/academicApiSlice";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
});
type FormValues = z.infer<typeof formSchema>;

export default function AcademicSettingsDashboard() {
  // Data for Academic Levels
  const { data: levels = [] } = useGetAcademicLevelsQuery();
  const [createLevel, { isLoading: isCreatingLevel }] =
    useCreateAcademicLevelMutation();

  // Data for Subjects
  const { data: subjects = [] } = useGetSubjectsQuery();
  const [createSubject, { isLoading: isCreatingSubject }] =
    useCreateSubjectMutation();

  const levelForm = useForm<FormValues>({ resolver: zodResolver(formSchema) });
  const subjectForm = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const onLevelSubmit = async (data: FormValues) => {
    try {
      await createLevel(data).unwrap();
      levelForm.reset({ name: "" });
    } catch (err) {
      console.error("Failed to create level:", err);
    }
  };

  const onSubjectSubmit = async (data: FormValues) => {
    try {
      await createSubject(data).unwrap();
      subjectForm.reset({ name: "" });
    } catch (err) {
      console.error("Failed to create subject:", err);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Academic Levels Card */}
      <Card>
        <CardHeader>
          <CardTitle>Academic Levels</CardTitle>
          <CardDescription>
            Manage grade levels, university years, etc.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={levelForm.handleSubmit(onLevelSubmit)}
            className="flex gap-2 mb-4"
          >
            <Input
              {...levelForm.register("name")}
              placeholder="e.g., Grade 12"
            />
            <Button type="submit" disabled={isCreatingLevel}>
              {isCreatingLevel ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Add"
              )}
            </Button>
          </form>
          <div className="space-y-2">
            {levels.map((level) => (
              <Badge key={level.id} variant="secondary">
                {level.name}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Subjects Card */}
      <Card>
        <CardHeader>
          <CardTitle>Subjects</CardTitle>
          <CardDescription>
            Manage the subjects that can be taught.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={subjectForm.handleSubmit(onSubjectSubmit)}
            className="flex gap-2 mb-4"
          >
            <Input
              {...subjectForm.register("name")}
              placeholder="e.g., Physics"
            />
            <Button type="submit" disabled={isCreatingSubject}>
              {isCreatingSubject ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Add"
              )}
            </Button>
          </form>
          <div className="space-y-2">
            {subjects.map((subject) => (
              <Badge key={subject.id} variant="secondary">
                {subject.name}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
