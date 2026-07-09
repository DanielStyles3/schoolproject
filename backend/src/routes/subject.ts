import express from "express";
import { authorize, protect } from "../middleware/auth.ts";
import validate from "../middleware/validate.ts";
import {
  createSubject,
  getSubjects,
  updateSubject,
  deleteSubject,
} from "../controllers/subject.ts";
import { subjectSchema } from "../middleware/validationSchemas.ts";

const subjectRouter = express.Router();

subjectRouter
  .route("/create")
  .post(protect, authorize(["admin"]), validate(subjectSchema), createSubject);

subjectRouter
  .route("/")
  .get(protect, authorize(["admin", "teacher", "student", "parent"]), getSubjects);

subjectRouter
  .route("/delete/:id")
  .delete(protect, authorize(["admin"]), deleteSubject);

subjectRouter
  .route("/update/:id")
  .patch(protect, authorize(["admin"]), validate(subjectSchema.partial()), updateSubject);

export default subjectRouter;
