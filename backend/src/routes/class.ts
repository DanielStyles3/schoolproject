import express from "express";
import {
  createClass,
  updateClass,
  deleteClass,
  getClasses,
  getPublicClasses,
} from "../controllers/class.ts";
import { authorize, protect } from "../middleware/auth.ts";
import validate from "../middleware/validate.ts";
import { classSchema } from "../middleware/validationSchemas.ts";

const classRouter = express.Router();

classRouter.get("/public", getPublicClasses);
classRouter.post("/create", protect, authorize(["admin"]), validate(classSchema), createClass);
classRouter.get("/", protect, authorize(["admin", "teacher", "student", "parent"]), getClasses);
classRouter.put("/update/:id", protect, authorize(["admin"]), validate(classSchema.partial()), updateClass);
classRouter.delete("/delete/:id", protect, authorize(["admin"]), deleteClass);

export default classRouter;
