import dotenv from "dotenv";
dotenv.config();

import cookieParser from "cookie-parser";
import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";

import userRoutes from "./routes/user.ts";
import academicYearRouter from "./routes/academicYear.ts";
import classRouter from "./routes/class.ts";
import subjectRouter from "./routes/subject.ts";
import dashboardRouter from "./routes/dashboard.ts";
import courseRegistrationRouter from "./routes/courseRegistration.ts";
import resultRouter from "./routes/result.ts";

import { responseMapper } from "./middleware/responseMapper.ts";
import { authRateLimiter } from "./middleware/rateLimiter.ts";

const app: Application = express();
const PORT = process.env.PORT || 5000;

const configuredOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const defaultDevOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3001",
];

const allowedOrigins = new Set([...defaultDevOrigins, ...configuredOrigins]);

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (process.env.STAGE === "development") {
  app.use(morgan("dev"));
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  })
);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ status: "OK", message: "Server is healthy" });
});

app.use("/api/users/login", authRateLimiter);
app.use("/api/users/register", authRateLimiter);

app.use(responseMapper);

app.use("/api/users", userRoutes);
app.use("/api/academic-years", academicYearRouter);
app.use("/api/classes", classRouter);
app.use("/api/subjects", subjectRouter);
app.use("/api/courses", subjectRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/course-registrations", courseRegistrationRouter);
app.use("/api/results", resultRouter);
app.use((err: Error, req: Request, res: Response, next: Function) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

if (process.env.VERCEL !== "1") {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;