import express from "express";
import { protect, authorize } from "../middleware/auth.ts";
import validate from "../middleware/validate.ts";
import {
  getCourseRegistrations,
  getRegistrationOptions,
  saveCourseRegistration,
  updateCourseRegistrationStatus,
} from "../controllers/courseRegistration.ts";
import {
  courseRegistrationSchema,
  registrationApprovalSchema,
} from "../middleware/validationSchemas.ts";

const courseRegistrationRouter = express.Router();

courseRegistrationRouter.get(
  "/available",
  protect,
  authorize(["admin", "teacher", "student"]),
  getRegistrationOptions,
);

courseRegistrationRouter.get(
  "/",
  protect,
  authorize(["admin", "teacher", "student"]),
  getCourseRegistrations,
);

courseRegistrationRouter.post(
  "/",
  protect,
  authorize(["admin", "teacher", "student"]),
  validate(courseRegistrationSchema),
  saveCourseRegistration,
);

courseRegistrationRouter.patch(
  "/:id/status",
  protect,
  authorize(["admin", "teacher"]),
  validate(registrationApprovalSchema),
  updateCourseRegistrationStatus,
);

export default courseRegistrationRouter;
