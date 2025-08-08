//SRC/routes/course.routes.ts

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
router.patch(
  "/:courseId/details",
  verifyToken,
  courseController.updateCourseDetails
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

router.get(
  "/:courseId/student-view",
  verifyToken,
  courseController.getCourseDetailsForStudent
);
router.put(
  "/enrollments/:studentId",
  verifyToken,
  verifyAdmin,
  courseController.setStudentEnrollments
);

export default router;
