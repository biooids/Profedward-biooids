import { Router } from "express";
import { courseController } from "../features/course/course.controller";
import { verifyToken, verifyAdmin } from "../middleware/auth.middleware";

const router: Router = Router();

// --- Teacher & Student Routes (Protected by login) ---
router.get("/my-courses", verifyToken, courseController.getCoursesForTeacher);
router.get(
  "/my-courses/student",
  verifyToken,
  courseController.getCoursesForStudent
);
router.get(
  "/:courseId/teacher-view",
  verifyToken,
  courseController.getCourseDetailsForTeacher
);

// --- Admin-Only Routes (Protected by login + admin role) ---
router.get("/", verifyToken, verifyAdmin, courseController.getAllCourses); // <-- ADD THIS LINE
router.post("/", verifyToken, verifyAdmin, courseController.createCourse);
router.post(
  "/:courseId/enroll",
  verifyToken,
  verifyAdmin,
  courseController.enrollStudent
);

export default router;
