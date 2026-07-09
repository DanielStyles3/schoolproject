import { type Request, type Response } from "express";
import { supabaseAdmin } from "../config/supabase.ts";

const getCurrentAcademicYear = async () => {
  const { data, error } = await supabaseAdmin
    .from("academic_years")
    .select("*")
    .eq("is_current", true)
    .single();

  if (error || !data) {
    throw new Error("No current academic year found");
  }

  return data;
};

const populateSubjects = async (subjectIds: string[]) => {
  if (!subjectIds.length) {
    return [];
  }

  const { data, error } = await supabaseAdmin
    .from("subjects")
    .select("*")
    .in("id", subjectIds);

  if (error) {
    throw new Error(error.message);
  }

  const subjectMap = new Map((data || []).map((subject: any) => [subject.id, subject]));
  return subjectIds.map((id) => subjectMap.get(id)).filter(Boolean);
};

export const getRegistrationOptions = async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).user;
    const targetStudentId =
      authUser?.role === "student" ? authUser.id : (req.query.studentId as string);

    if (!targetStudentId) {
      res.status(400).json({ message: "studentId is required" });
      return;
    }

    const { data: student, error: studentError } = await supabaseAdmin
      .from("users")
      .select("id, name, email, student_class")
      .eq("id", targetStudentId)
      .single();

    if (studentError || !student) {
      res.status(404).json({ message: "Student not found" });
      return;
    }

    if (!student.student_class) {
      res.status(400).json({ message: "Student is not assigned to a class" });
      return;
    }

    const { data: classData, error: classError } = await supabaseAdmin
      .from("classes")
      .select("id, name, subjects, academic_year:academic_years(*)")
      .eq("id", student.student_class)
      .single();

    if (classError || !classData) {
      res.status(404).json({ message: "Class not found" });
      return;
    }

    const currentYear = await getCurrentAcademicYear();

    const { data: registration } = await supabaseAdmin
      .from("course_registrations")
      .select("*")
      .eq("student_id", targetStudentId)
      .eq("academic_year_id", currentYear.id)
      .maybeSingle();

    const subjects = await populateSubjects(classData.subjects || []);

    res.json({
      student,
      class: classData,
      academicYear: currentYear,
      subjects,
      registration,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Server Error" });
  }
};

export const getCourseRegistrations = async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).user;
    const studentId = authUser?.role === "student" ? authUser.id : (req.query.studentId as string);
    const classId = req.query.classId as string | undefined;
    const academicYearId = req.query.academicYearId as string | undefined;

    let query = supabaseAdmin
      .from("course_registrations")
      .select(
        "*, student:users!student_id(id, name, email), class:classes!class_id(id, name), academic_year:academic_years!academic_year_id(id, name)",
        { count: "exact" },
      )
      .order("updated_at", { ascending: false });

    if (studentId) {
      query = query.eq("student_id", studentId);
    }

    if (classId) {
      query = query.eq("class_id", classId);
    }

    if (academicYearId) {
      query = query.eq("academic_year_id", academicYearId);
    }

    const { data, error, count } = await query;

    if (error) {
      res.status(500).json({ message: error.message });
      return;
    }

    const allSubjectIds = Array.from(
      new Set((data || []).flatMap((registration: any) => registration.subject_ids || [])),
    );
    const subjects = await populateSubjects(allSubjectIds);
    const subjectMap = new Map(subjects.map((subject: any) => [subject.id, subject]));

    const registrations = (data || []).map((registration: any) => ({
      ...registration,
      subjects: (registration.subject_ids || [])
        .map((subjectId: string) => subjectMap.get(subjectId))
        .filter(Boolean),
    }));

    res.json({
      registrations,
      pagination: {
        total: count || registrations.length,
        page: 1,
        pages: 1,
        limit: registrations.length || 1,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Server Error" });
  }
};

export const saveCourseRegistration = async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).user;
    const studentId =
      authUser?.role === "student" ? authUser.id : req.body.studentId;
    const subjectIds: string[] = req.body.subjectIds || [];

    if (!studentId || subjectIds.length === 0) {
      res.status(400).json({ message: "studentId and subjectIds are required" });
      return;
    }

    const { data: student, error: studentError } = await supabaseAdmin
      .from("users")
      .select("id, student_class")
      .eq("id", studentId)
      .single();

    if (studentError || !student) {
      res.status(404).json({ message: "Student not found" });
      return;
    }

    if (!student.student_class) {
      res.status(400).json({ message: "Student is not assigned to a class" });
      return;
    }

    const { data: classData, error: classError } = await supabaseAdmin
      .from("classes")
      .select("id, subjects")
      .eq("id", student.student_class)
      .single();

    if (classError || !classData) {
      res.status(404).json({ message: "Class not found" });
      return;
    }

    const classSubjectIds: string[] = classData.subjects || [];
    const hasInvalidSubject = subjectIds.some((subjectId) => !classSubjectIds.includes(subjectId));

    if (hasInvalidSubject) {
      res.status(400).json({ message: "One or more selected subjects are not in the student's class" });
      return;
    }

    const currentYear = req.body.academicYearId
      ? { id: req.body.academicYearId }
      : await getCurrentAcademicYear();

    const { data, error } = await supabaseAdmin
      .from("course_registrations")
      .upsert(
        {
          student_id: studentId,
          class_id: student.student_class,
          academic_year_id: currentYear.id,
          subject_ids: subjectIds,
          status: "approved",
        },
        { onConflict: "student_id,academic_year_id" },
      )
      .select()
      .single();

    if (error) {
      res.status(400).json({ message: error.message });
      return;
    }

    res.status(201).json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Server Error" });
  }
};

export const updateCourseRegistrationStatus = async (
  req: Request,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id) {
      res.status(400).json({ message: "Registration ID is required" });
      return;
    }

    const { data, error } = await supabaseAdmin
      .from("course_registrations")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      res.status(400).json({ message: error.message });
      return;
    }

    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Server Error" });
  }
};

