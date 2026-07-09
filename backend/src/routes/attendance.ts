import express from "express";
import { protect, authorize } from "../middleware/auth.ts";
import {
  getAttendance,
  saveAttendance,
} from "../controllers/attendance.ts";

const attendanceRouter = express.Router();

attendanceRouter.get("/", protect, authorize(["admin", "teacher", "student"]), getAttendance);
attendanceRouter.post("/", protect, authorize(["admin", "teacher"]), saveAttendance);

export default attendanceRouter;