"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  assignmentDetailsSchema,
  AssignmentDetailsFormValues,
} from "@/lib/schemas/assignment.schemas";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface AssignmentDetailsFormProps {
  onNext: (data: AssignmentDetailsFormValues) => void;
}

export default function AssignmentDetailsForm({
  onNext,
}: AssignmentDetailsFormProps) {
  const form = useForm<AssignmentDetailsFormValues>({
    resolver: zodResolver(assignmentDetailsSchema),
  });

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Step 1: Assignment Details</CardTitle>
        <CardDescription>
          Enter the title, instructions, and due date for your assignment.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onNext)} className="space-y-4">
          <div>
            <Label htmlFor="title">Assignment Title</Label>
            <Input id="title" {...form.register("title")} />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="instructions">Instructions (Optional)</Label>
            <Textarea id="instructions" {...form.register("instructions")} />
          </div>

          <div>
            <Label>Due Date (Optional)</Label>
            <Controller
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit">Next: Add Worksheet</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
