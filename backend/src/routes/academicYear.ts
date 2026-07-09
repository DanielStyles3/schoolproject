import express from "express";
import {
  createAcademicYear,
  getCurrentAcademicYear,
  updateAcademicYear,
  deleteAcademicYear,
  getAllAcademicYears,
} from "../controllers/academicYear.ts";

import { authorize, protect } from "../middleware/auth.ts";
import validate from "../middleware/validate.ts";
import { academicYearSchema } from "../middleware/validationSchemas.ts";

const academicYearRouter = express.Router();

academicYearRouter
  .route("/")
  .get(protect, authorize(["admin", "teacher", "student", "parent"]), getAllAcademicYears);

academicYearRouter
  .route("/create")
  .post(protect, authorize(["admin"]), validate(academicYearSchema), createAcademicYear);

academicYearRouter.route("/current").get(protect, getCurrentAcademicYear);

academicYearRouter
  .route("/update/:id")
  .patch(protect, authorize(["admin"]), validate(academicYearSchema.partial()), updateAcademicYear);

academicYearRouter
  .route("/delete/:id")
  .delete(protect, authorize(["admin"]), deleteAcademicYear);

export default academicYearRouter;
