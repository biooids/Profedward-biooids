import { Request, Response } from "express";
import { asyncHandler } from "../../middleware/asyncHandler";
import { courseService } from "./course.service";
import {
  CreateCourseDto,
  EnrollStudentDto,
  SetStudentEnrollmentDto,
} from "./course.types";

class CourseController {
  createCourse = asyncHandler(async (req: Request, res: Response) => {
    const courseData = req.body as CreateCourseDto;
    const newCourse = await courseService.createCourse(courseData);
    res.status(201).json({
      status: "success",
      message: "Course created successfully.",
      data: newCourse,
    });
  });

  enrollStudent = asyncHandler(async (req: Request, res: Response) => {
    const { courseId } = req.params;
    const studentData = req.body as EnrollStudentDto;
    const updatedCourse = await courseService.enrollStudent(
      courseId,
      studentData
    );
    res.status(200).json({
      status: "success",
      message: "Student enrolled successfully.",
      data: updatedCourse,
    });
  });

  getCoursesForTeacher = asyncHandler(async (req: Request, res: Response) => {
    const teacherId = req.user!.id;
    const courses = await courseService.getCoursesForTeacher(teacherId);
    res.status(200).json({ status: "success", data: courses });
  });

  getCourseDetailsForTeacher = asyncHandler(
    async (req: Request, res: Response) => {
      const teacherId = req.user!.id;
      const { courseId } = req.params;
      const course = await courseService.getCourseDetailsForTeacher(
        courseId,
        teacherId
      );
      res.status(200).json({ status: "success", data: course });
    }
  );

  getCoursesForStudent = asyncHandler(async (req: Request, res: Response) => {
    const studentId = req.user!.id;
    const courses = await courseService.getCoursesForStudent(studentId);
    res.status(200).json({ status: "success", data: courses });
  });

  getAllCourses = asyncHandler(async (req: Request, res: Response) => {
    const courses = await courseService.getAllCourses();
    res.status(200).json({ status: "success", data: courses });
  });

  getCourseDetailsForStudent = asyncHandler(
    async (req: Request, res: Response) => {
      const studentId = req.user!.id;
      const { courseId } = req.params;
      const course = await courseService.getCourseDetailsForStudent(
        courseId,
        studentId
      );
      res.status(200).json({ status: "success", data: course });
    }
  );

  setStudentEnrollments = asyncHandler(async (req: Request, res: Response) => {
    const { studentId } = req.params;
    const enrollmentData = req.body as SetStudentEnrollmentDto;

    const updatedUser = await courseService.setStudentEnrollments(
      studentId,
      enrollmentData
    );

    res.status(200).json({
      status: "success",
      message: "Student enrollments updated successfully.",
      data: updatedUser.enrolledCourses,
    });
  });
}

export const courseController = new CourseController();
