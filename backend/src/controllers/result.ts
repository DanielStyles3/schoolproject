import { type Request, type Response } from "express";
import { supabaseAdmin } from "../config/supabase.ts";

const resolveCurrentAcademicYearId = async () => {
  const { data, error } = await supabaseAdmin
    .from("academic_years")
    .select("id")
    .eq("is_current", true)
    .single();

  if (error || !data) {
    throw new Error("No current academic year found");
  }

  return data.id;
};

const calculateGrade = (totalScore: number) => {
  if (totalScore >= 70) return { grade: "A", remark: "Excellent" };
  if (totalScore >= 60) return { grade: "B", remark: "Very Good" };
  if (totalScore >= 50) return { grade: "C", remark: "Good" };
  if (totalScore >= 45) return { grade: "D", remark: "Fair" };
  if (totalScore >= 40) return { grade: "E", remark: "Pass" };
  return { grade: "F", remark: "Fail" };
};

const gradePointMap: Record<string, number> = {
  A: 5,
  B: 4,
  C: 3,
  D: 2,
  E: 1,
  F: 0,
};

const ensureTeacherOwnsSubject = (authUser: any, subject: any) => {
  if (
    authUser?.role === "teacher" &&
    !(subject.teacher || []).includes(authUser.id)
  ) {
    return false;
  }

  return true;
};

export const getResults = async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).user;
    const studentId = authUser?.role === "student" ? authUser.id : (req.query.studentId as string);
    const classId = req.query.classId as string | undefined;
    const subjectId = req.query.subjectId as string | undefined;
    const academicYearId = req.query.academicYearId as string | undefined;

    let query = supabaseAdmin
      .from("results")
      .select(
        "*, student:users!student_id(id, name, email), subject:subjects!subject_id(id, name, code, unit), class:classes!class_id(id, name), academic_year:academic_years!academic_year_id(id, name)",
      )
      .order("updated_at", { ascending: false });

    if (studentId) {
      query = query.eq("student_id", studentId);
    }

    if (classId) {
      query = query.eq("class_id", classId);
    }

    if (subjectId) {
      query = query.eq("subject_id", subjectId);
    }

    if (academicYearId) {
      query = query.eq("academic_year_id", academicYearId);
    }

    if (authUser?.role === "teacher") {
      const assignedSubjectIds = authUser.teacher_subject || [];
      if (!assignedSubjectIds.length) {
        res.json([]);
        return;
      }
      query = query.in("subject_id", assignedSubjectIds);
    }

    if (authUser?.role === "student") {
      query = query.eq("result_status", "published");
    }

    const { data, error } = await query;

    if (error) {
      res.status(500).json({ message: error.message });
      return;
    }

    if (authUser?.role === "student") {
      const records = data || [];
      const summary = records.reduce(
        (acc: any, item: any) => {
          const unit = Number(item.subject?.unit || 0);
          const point = Number(item.quality_points || 0);
          acc.totalUnits += unit;
          acc.totalQualityPoints += point;
          return acc;
        },
        { totalUnits: 0, totalQualityPoints: 0 },
      );

      const gpa =
        summary.totalUnits > 0
          ? Number((summary.totalQualityPoints / summary.totalUnits).toFixed(2))
          : 0;

      res.json({
        results: records,
        summary: {
          totalCourses: records.length,
          totalUnits: summary.totalUnits,
          totalQualityPoints: summary.totalQualityPoints,
          gpa,
        },
      });
      return;
    }

    res.json(data || []);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Server Error" });
  }
};

export const saveResult = async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).user;
    const { studentId, subjectId, caScore, examScore } = req.body;

    if (!studentId || !subjectId) {
      res.status(400).json({ message: "studentId and subjectId are required" });
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

    const { data: subject, error: subjectError } = await supabaseAdmin
      .from("subjects")
      .select("id, teacher, unit")
      .eq("id", subjectId)
      .single();

    if (subjectError || !subject) {
      res.status(404).json({ message: "Subject not found" });
      return;
    }

    const academicYearId = req.body.academicYearId || (await resolveCurrentAcademicYearId());

    const { data: registration, error: registrationError } = await supabaseAdmin
      .from("course_registrations")
      .select("id, subject_ids, status")
      .eq("student_id", studentId)
      .eq("class_id", student.student_class)
      .eq("academic_year_id", academicYearId)
      .maybeSingle();

    if (registrationError) {
      res.status(400).json({ message: registrationError.message });
      return;
    }

    const registeredSubjects = registration?.subject_ids || [];
    if (!registration || !registeredSubjects.includes(subjectId)) {
      res.status(400).json({
        message: "This student has not registered for the selected course in the current academic year",
      });
      return;
    }

    if (!ensureTeacherOwnsSubject(authUser, subject)) {
      res.status(403).json({ message: "You are not assigned to this subject" });
      return;
    }

    const totalScore = Number(caScore) + Number(examScore);
    const { grade, remark } = calculateGrade(totalScore);
    const unit = Number(subject.unit || 0);
    const qualityPoints = (gradePointMap[grade] ?? 0) * unit;

    const { data, error } = await supabaseAdmin
      .from("results")
      .upsert(
        {
          student_id: studentId,
          subject_id: subjectId,
          class_id: student.student_class,
          academic_year_id: academicYearId,
          ca_score: Number(caScore),
          exam_score: Number(examScore),
          total_score: totalScore,
          grade,
          remark,
          quality_points: qualityPoints,
          result_status: "draft",
        },
        { onConflict: "student_id,subject_id,academic_year_id" },
      )
      .select(
        "*, student:users!student_id(id, name, email), subject:subjects!subject_id(id, name, code, unit), class:classes!class_id(id, name), academic_year:academic_years!academic_year_id(id, name)",
      )
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

export const publishResults = async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).user;
    const { classId, subjectId } = req.body;
    const academicYearId = req.body.academicYearId || (await resolveCurrentAcademicYearId());

    const { data: subject, error: subjectError } = await supabaseAdmin
      .from("subjects")
      .select("id, teacher")
      .eq("id", subjectId)
      .single();

    if (subjectError || !subject) {
      res.status(404).json({ message: "Subject not found" });
      return;
    }

    if (!ensureTeacherOwnsSubject(authUser, subject)) {
      res.status(403).json({ message: "You are not assigned to this subject" });
      return;
    }

    const { data: existingResults, error: existingError } = await supabaseAdmin
      .from("results")
      .select("id")
      .eq("class_id", classId)
      .eq("subject_id", subjectId)
      .eq("academic_year_id", academicYearId);

    if (existingError) {
      res.status(400).json({ message: existingError.message });
      return;
    }

    if (!existingResults || existingResults.length === 0) {
      res.status(400).json({ message: "No saved results were found to publish for this course" });
      return;
    }

    const { data, error } = await supabaseAdmin
      .from("results")
      .update({ result_status: "published" })
      .eq("class_id", classId)
      .eq("subject_id", subjectId)
      .eq("academic_year_id", academicYearId)
      .select(
        "*, student:users!student_id(id, name, email), subject:subjects!subject_id(id, name, code, unit), class:classes!class_id(id, name), academic_year:academic_years!academic_year_id(id, name)",
      );

    if (error) {
      res.status(400).json({ message: error.message });
      return;
    }

    res.json({
      message: `Published ${data?.length || 0} result record(s) successfully`,
      results: data || [],
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Server Error" });
  }
};
