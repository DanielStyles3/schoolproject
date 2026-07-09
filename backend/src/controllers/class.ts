import { type Request, type Response } from "express";
import { supabaseAdmin } from "../config/supabase.ts";

const populateClassDetails = async (classObj: any) => {
  if (!classObj) return classObj;

  if (classObj.academic_year && typeof classObj.academic_year === "string") {
    const { data: year } = await supabaseAdmin
      .from("academic_years")
      .select("*")
      .eq("id", classObj.academic_year)
      .single();
    classObj.academic_year = year;
  }

  if (classObj.class_teacher && typeof classObj.class_teacher === "string") {
    const { data: teacher } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", classObj.class_teacher)
      .single();
    classObj.class_teacher = teacher;
  }

  if (classObj.subjects && classObj.subjects.length > 0) {
    const { data: subjects } = await supabaseAdmin
      .from("subjects")
      .select("*")
      .in("id", classObj.subjects);
    classObj.subjects = subjects || [];
  } else {
    classObj.subjects = [];
  }

  return classObj;
};

export const createClass = async (req: Request, res: Response) => {
  try {
    const { name, academicYear, classTeacher, subjects, capacity } = req.body;

    const { data, error } = await supabaseAdmin
      .from("classes")
      .insert({
        name,
        academic_year: academicYear,
        class_teacher: classTeacher || null,
        subjects: subjects || [],
        capacity: capacity || 40,
      })
      .select()
      .single();

    if (error) {
      res.status(400).json({ message: error.message });
      return;
    }

    const populated = await populateClassDetails(data);
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const getPublicClasses = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("classes")
      .select("id, name")
      .order("name", { ascending: true });

    if (error) {
      res.status(500).json({ message: error.message });
      return;
    }

    res.json({
      classes: data || [],
      pagination: {
        total: (data || []).length,
        page: 1,
        pages: 1,
        limit: (data || []).length || 1,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const getClasses = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search as string;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabaseAdmin
      .from("classes")
      .select("*, academic_year:academic_years(*), class_teacher:users!class_teacher(*)", { count: "exact" });

    if (search) {
      query = query.ilike("name", `%${search}%`);
    }

    const { data: classes, error, count } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      res.status(500).json({ message: error.message });
      return;
    }

    const subjectIds = new Set<string>();
    classes?.forEach((c: any) => {
      if (c.subjects) {
        c.subjects.forEach((sid: string) => subjectIds.add(sid));
      }
    });

    const subjectsMap: Record<string, any> = {};
    if (subjectIds.size > 0) {
      const { data: subjects } = await supabaseAdmin
        .from("subjects")
        .select("*")
        .in("id", Array.from(subjectIds));
      subjects?.forEach((s: any) => {
        subjectsMap[s.id] = s;
      });
    }

    const classIds = (classes || []).map((c: any) => c.id);
    const studentsByClass: Record<string, any[]> = {};
    if (classIds.length > 0) {
      const { data: students } = await supabaseAdmin
        .from("users")
        .select("id, name, email, student_class")
        .eq("role", "student")
        .in("student_class", classIds);

      (students || []).forEach((student: any) => {
        const classId = student.student_class;
        if (!studentsByClass[classId]) {
          studentsByClass[classId] = [];
        }
        studentsByClass[classId].push(student);
      });
    }

    const mappedClasses = (classes || []).map((c: any) => {
      const classSubjects = (c.subjects || [])
        .map((sid: string) => subjectsMap[sid])
        .filter(Boolean);
      return {
        ...c,
        subjects: classSubjects,
        students: studentsByClass[c.id] || [],
      };
    });

    res.json({
      classes: mappedClasses,
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

export const updateClass = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, academicYear, classTeacher, subjects, capacity } = req.body;

    const { data, error } = await supabaseAdmin
      .from("classes")
      .update({
        name,
        academic_year: academicYear,
        class_teacher: classTeacher || null,
        subjects: subjects || [],
        capacity: capacity || 40,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      res.status(400).json({ message: error.message });
      return;
    }

    const populated = await populateClassDetails(data);
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const deleteClass = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin.from("classes").delete().eq("id", id);

    if (error) {
      res.status(400).json({ message: error.message });
      return;
    }

    res.json({ message: "Class deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
