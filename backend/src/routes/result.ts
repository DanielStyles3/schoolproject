import express from "express";
import { protect, authorize } from "../middleware/auth.ts";
import validate from "../middleware/validate.ts";
import { getResults, saveResult, publishResults } from "../controllers/result.ts";
import { resultSchema, publishResultsSchema } from "../middleware/validationSchemas.ts";

const resultRouter = express.Router();

resultRouter.get(
  "/",
  protect,
  authorize(["admin", "teacher", "student"]),
  getResults,
);

resultRouter.post(
  "/",
  protect,
  authorize(["admin", "teacher"]),
  validate(resultSchema),
  saveResult,
);

resultRouter.patch(
  "/publish",
  protect,
  authorize(["admin", "teacher"]),
  validate(publishResultsSchema),
  publishResults,
);

export default resultRouter;
