import { z } from "zod";

// Matches your Mongoose Schema
export interface SubjectData {
  _id: string;
  name: string;
  code: string;
  unit?: number;
  teacher: string[] | null;
  classIds?: string[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Zod Schema for Form
export const subjectFormSchema = z.object({
  name: z
    .string({ error: "Name is required" })
    .min(2, "Name must be at least 2 chars"),
  code: z
    .string({ error: "Code is required" })
    .min(2, "Code is required")
    .toUpperCase(),
  unit: z.coerce.number().int().positive().max(10).default(3),
  teacher: z.array(z.string()).optional(),
  classIds: z.array(z.string()).optional().default([]),
  isActive: z.boolean().optional().default(true),
});

export type SubjectFormValues = z.infer<typeof subjectFormSchema>;
