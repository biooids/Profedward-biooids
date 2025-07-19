"use client";

import { useState, useMemo } from "react";
import { useGetPendingAssignmentsQuery } from "@/lib/assignment/assignmentApiSlice";
import { Loader2, LayoutGrid, List, Search, ArrowRight } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Assignment } from "@/lib/assignment/assignmentTypes";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export default function PendingAssignmentsList() {
  const { data: assignments = [], isLoading } = useGetPendingAssignmentsQuery();
  const [layout, setLayout] = useState<"card" | "list">("card");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredAssignments = useMemo(() => {
    if (!searchTerm) return assignments;
    const lowercasedFilter = searchTerm.toLowerCase();

    return assignments.filter((assignment) => {
      const teacher = assignment.course.teachers?.[0]?.displayName || "";
      const courseName = `${assignment.course.academicLevel.name} ${assignment.course.subject.name}`;

      return (
        assignment.title.toLowerCase().includes(lowercasedFilter) ||
        courseName.toLowerCase().includes(lowercasedFilter) ||
        teacher.toLowerCase().includes(lowercasedFilter)
      );
    });
  }, [assignments, searchTerm]);

  if (isLoading) {
    return (
      <div className="flex justify-center pt-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by assignment, course, or teacher..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <ToggleGroup
          type="single"
          value={layout}
          onValueChange={(value: "card" | "list") => value && setLayout(value)}
        >
          <ToggleGroupItem value="card" aria-label="Card view">
            <LayoutGrid className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="list" aria-label="List view">
            <List className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {filteredAssignments.length === 0 ? (
        <p className="text-sm text-center py-10 text-muted-foreground">
          {searchTerm
            ? "No assignments match your search."
            : "You have no pending assignments. Great job!"}
        </p>
      ) : layout === "card" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAssignments.map((assignment: Assignment) => {
            const submissionId = assignment.submissions[0]?.id;
            if (!submissionId) return null;

            return (
              <Card key={assignment.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle>{assignment.title}</CardTitle>
                  <CardDescription>
                    {assignment.course.academicLevel.name} -{" "}
                    {assignment.course.subject.name} • Taught by{" "}
                    {assignment.course.teachers[0]?.displayName || "N/A"}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="mt-auto flex justify-between items-center">
                  <p className="text-xs text-muted-foreground">
                    Due:{" "}
                    {assignment.dueDate
                      ? new Date(assignment.dueDate).toLocaleDateString()
                      : "No due date"}
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/student/submission/${submissionId}`}>
                      Start Assignment <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <div className="flex flex-col">
            {filteredAssignments.map((assignment: Assignment) => {
              const submissionId = assignment.submissions[0]?.id;
              if (!submissionId) return null;

              return (
                <Link
                  key={assignment.id}
                  href={`/student/submission/${submissionId}`}
                  className="block"
                >
                  <div className="flex items-center p-4 border-b last:border-b-0 hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <p className="font-medium">{assignment.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {assignment.course.academicLevel.name} -{" "}
                        {assignment.course.subject.name} • Taught by{" "}
                        {assignment.course.teachers[0]?.displayName || "N/A"}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground ml-4">
                      Due:{" "}
                      {assignment.dueDate
                        ? new Date(assignment.dueDate).toLocaleDateString()
                        : "No due date"}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
