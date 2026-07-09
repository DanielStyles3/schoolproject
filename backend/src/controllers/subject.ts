import { type Request, type Response } from "express";
import { supabaseAdmin } from "../config/supabase.ts";
import { syncTeacherAssignmentsForSubject } from "../utils/subjectAssignments.ts";
const toStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item)).filter(Boolean);
};

const toStringValue = (value: unknown): string => {
  if (Array.isArray(value)) return String(value[0] || "");
  return value ? String(value) : "";
};

const syncSubjectClasses = async (subjectId: string, classIds: string[]) => {
  const { data: classes, error } = await supabaseAdmin
    .from("classes")
    .select("id, subjects");

  if (error) {
    throw new Error(error.message);
  }

  const updates = (classes || []).map(async (classItem: any) => {
    const currentSubjects: string[] = classItem.subjects || [];
    const shouldInclude = classIds.includes(classItem.id);
    const alreadyIncluded = currentSubjects.includes(subjectId);

    let nextSubjects = currentSubjects;

    if (shouldInclude && !alreadyIncluded) {
      nextSubjects = [...currentSubjects, subjectId];
    }

    if (!shouldInclude && alreadyIncluded) {
      nextSubjects = currentSubjects.filter((item) => item !== subjectId);
    }

    if (nextSubjects === currentSubjects) {
      return;
    }

    const { error: updateError } = await supabaseAdmin
      .from("classes")
      .update({ subjects: nextSubjects })
      .eq("id", classItem.id);

    if (updateError) {
      throw new Error(updateError.message);
    }
  });

  await Promise.all(updates);
};

export const createSubject = async (req: Request, res: Response) => {
  try {
    const { name, code, unit, isActive, teacher, classIds } = req.body;
    const teacherIds = toStringArray(teacher);
    const selectedClassIds = toStringArray(classIds);

    const { data, error } = await supabaseAdmin
      .from("subjects")
      .insert({
        name,
        code,
        unit: unit || 3,
        teacher: teacherIds,
        is_active: isActive,
      })
      .select()
      .single();

    if (error) {
      res.status(400).json({ message: error.message });
      return;
    }

    await syncTeacherAssignmentsForSubject(data.id, teacherIds);
    await syncSubjectClasses(data.id, selectedClassIds);

    res.status(201).json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Server Error" });
  }
};

export const getSubjects = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search as string;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabaseAdmin
      .from("subjects")
      .select("*", { count: "exact" });

    if (search) {
      query = query.or(`name.ilike.%${search}%,code.ilike.%${search}%`);
    }

    const { data: subjects, error, count } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      res.status(500).json({ message: error.message });
      return;
    }

    const teacherIds = new Set<string>();
    subjects?.forEach((s: any) => {
      if (s.teacher) {
        s.teacher.forEach((tid: string) => teacherIds.add(tid));
      }
    });

    const teachersMap: Record<string, any> = {};
    if (teacherIds.size > 0) {
      const { data: teachers } = await supabaseAdmin
        .from("users")
        .select("id, name")
        .in("id", Array.from(teacherIds));
      teachers?.forEach((t: any) => {
        teachersMap[t.id] = t;
      });
    }

    const mappedSubjects = (subjects || []).map((s: any) => {
      const teachers = (s.teacher || [])
        .map((tid: string) => teachersMap[tid])
        .filter(Boolean);
      return {
        ...s,
        teacher: teachers,
      };
    });

    res.json({
      subjects: mappedSubjects,
      pagination: {
        total: count || 0,
        page,
        pages: Math.ceil((count || 0) / limit),
        limit,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const updateSubject = async (req: Request, res: Response) => {
  try {
    const id = toStringValue(req.params.id);
    if (!id) {
      res.status(400).json({ message: "Subject ID is required" });
      return;
    }
    const { name, code, unit, isActive, teacher, classIds } = req.body;
    const teacherIds = toStringArray(teacher);
    const selectedClassIds = toStringArray(classIds);

    const { data, error } = await supabaseAdmin
      .from("subjects")
      .update({
        name,
        code,
        unit: unit || 3,
        teacher: teacherIds,
        is_active: isActive,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      res.status(400).json({ message: error.message });
      return;
    }

    await syncTeacherAssignmentsForSubject(id, teacherIds);
    await syncSubjectClasses(id, selectedClassIds);

    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Server Error" });
  }
};

export const deleteSubject = async (req: Request, res: Response) => {
  try {
    const id = toStringValue(req.params.id);
    if (!id) {
      res.status(400).json({ message: "Subject ID is required" });
      return;
    }

    await syncTeacherAssignmentsForSubject(id, []);
    await syncSubjectClasses(id, []);

    const { error } = await supabaseAdmin.from("subjects").delete().eq("id", id);

    if (error) {
      res.status(400).json({ message: error.message });
      return;
    }

    res.json({ message: "Subject deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Server Error" });
  }
};


