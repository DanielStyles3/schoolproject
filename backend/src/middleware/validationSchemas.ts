import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.string().optional(),
  studentClass: z.string().uuid().optional(),
  teacherSubject: z.array(z.string().uuid()).optional(),
  teacherSubjects: z.array(z.string().uuid()).optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.union([
    z.string().min(6, "Password must be at least 6 characters"),
    z.literal(""),
  ]).optional(),
});

export const classSchema = z.object({
  name: z.string().min(1, "Class name is required"),
  academicYear: z.string().uuid("Invalid academic year ID"),
  classTeacher: z.string().uuid().optional(),
  subjects: z.array(z.string().uuid()).optional(),
  capacity: z.number().int().positive().optional(),
});

export const subjectSchema = z.object({
  name: z.string().min(1, "Subject name is required"),
  code: z.string().min(1, "Subject code is required"),
  unit: z.number().int().positive().max(10).optional(),
  teacher: z.array(z.string().uuid()).nullable().optional(),
  isActive: z.boolean().optional(),
});

export const academicYearSchema = z.object({
  name: z.string().min(1, "Academic year name is required"),
  fromYear: z.union([z.string().datetime(), z.date()]),
  toYear: z.union([z.string().datetime(), z.date()]),
  isCurrent: z.boolean().optional(),
});

export const courseRegistrationSchema = z.object({
  studentId: z.string().uuid().optional(),
  academicYearId: z.string().uuid().optional(),
  subjectIds: z.array(z.string().uuid()).min(1, "Select at least one subject"),
});

export const registrationApprovalSchema = z.object({
  status: z.enum(["submitted", "approved"]),
});

export const resultSchema = z.object({
  studentId: z.string().uuid(),
  subjectId: z.string().uuid(),
  academicYearId: z.string().uuid().optional(),
  caScore: z.number().min(0).max(40),
  examScore: z.number().min(0).max(60),
});

export const publishResultsSchema = z.object({
  classId: z.string().uuid(),
  subjectId: z.string().uuid(),
  academicYearId: z.string().uuid().optional(),
});

