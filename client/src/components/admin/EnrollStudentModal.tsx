"use client";

import { useState, useEffect } from "react";
import {
  useGetCoursesQuery,
  useSetStudentEnrollmentsMutation,
} from "@/lib/course/courseApiSlice";
import { User } from "@/lib/user/userTypes";
import { Course } from "@/lib/course/courseTypes";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EnrollStudentModalProps {
  student: User | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const groupCoursesByLevel = (courses: Course[]) => {
  return courses.reduce((acc, course) => {
    const levelName = course.academicLevel.name;
    (acc[levelName] = acc[levelName] || []).push(course);
    return acc;
  }, {} as Record<string, Course[]>);
};

export default function EnrollStudentModal({
  student,
  isOpen,
  onOpenChange,
}: EnrollStudentModalProps) {
  const { data: allCourses = [], isLoading: isLoadingCourses } =
    useGetCoursesQuery();
  const [setStudentEnrollments, { isLoading: isSaving }] =
    useSetStudentEnrollmentsMutation();
  const [selectedCourseIds, setSelectedCourseIds] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    // When the modal opens, pre-select the courses the student is already enrolled in.
    // NOTE: This assumes the 'student' prop includes their 'enrolledCourses'.
    // We may need to fetch the user details separately if not.
    if (student && student.enrolledCourses) {
      setSelectedCourseIds(new Set(student.enrolledCourses.map((c) => c.id)));
    }
  }, [student, isOpen]);

  const handleCheckboxChange = (courseId: string, checked: boolean) => {
    setSelectedCourseIds((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(courseId);
      } else {
        newSet.delete(courseId);
      }
      return newSet;
    });
  };

  const handleSave = async () => {
    if (!student) return;
    try {
      await setStudentEnrollments({
        studentId: student.id,
        data: { courseIds: Array.from(selectedCourseIds) },
      }).unwrap();
      onOpenChange(false);
    } catch (err) {
      console.error("Failed to update enrollments:", err);
    }
  };

  const groupedCourses = groupCoursesByLevel(allCourses);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enroll {student?.displayName}</DialogTitle>
          <DialogDescription>
            Select all the courses this student should be enrolled in.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-72 my-4">
          <div className="space-y-4 pr-6">
            {isLoadingCourses ? (
              <Loader2 className="mx-auto h-6 w-6 animate-spin" />
            ) : (
              Object.entries(groupedCourses).map(
                ([levelName, coursesInLevel]) => (
                  <div key={levelName}>
                    <h4 className="font-semibold mb-2 text-sm">{levelName}</h4>
                    <div className="space-y-2">
                      {coursesInLevel.map((course) => (
                        <div
                          key={course.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={course.id}
                            checked={selectedCourseIds.has(course.id)}
                            onCheckedChange={(checked) =>
                              handleCheckboxChange(course.id, !!checked)
                            }
                          />
                          <Label htmlFor={course.id} className="font-normal">
                            {course.subject.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )
            )}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Enrollments
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
