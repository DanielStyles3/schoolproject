import { type Request, type Response } from "express";
import { supabaseAdmin } from "../config/supabase.ts";

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    let stats = {};
    const { data: currentYear } = await supabaseAdmin
      .from("academic_years")
      .select("id, name")
      .eq("is_current", true)
      .maybeSingle();

    if (user.role === "admin") {
      const [
        { count: totalStudents },
        { count: totalTeachers },
        { count: totalClasses },
        { count: totalSubjects },
        { count: totalResults },
        { count: totalRegistrations },
      ] = await Promise.all([
        supabaseAdmin
          .from("users")
          .select("*", { count: "exact", head: true })
          .eq("role", "student"),
        supabaseAdmin
          .from("users")
          .select("*", { count: "exact", head: true })
          .eq("role", "teacher"),
        supabaseAdmin.from("classes").select("*", { count: "exact", head: true }),
        supabaseAdmin.from("subjects").select("*", { count: "exact", head: true }),
        currentYear?.id
          ? supabaseAdmin
              .from("results")
              .select("*", { count: "exact", head: true })
              .eq("academic_year_id", currentYear.id)
          : supabaseAdmin.from("results").select("*", { count: "exact", head: true }),
        currentYear?.id
          ? supabaseAdmin
              .from("course_registrations")
              .select("*", { count: "exact", head: true })
              .eq("academic_year_id", currentYear.id)
          : supabaseAdmin
              .from("course_registrations")
              .select("*", { count: "exact", head: true }),
      ]);

      stats = {
        totalStudents: totalStudents || 0,
        totalTeachers: totalTeachers || 0,
        totalClasses: totalClasses || 0,
        totalSubjects: totalSubjects || 0,
        totalResults: totalResults || 0,
        pendingRegistrations: totalRegistrations || 0,
        approvedRegistrations: totalRegistrations || 0,
        currentAcademicYear: currentYear?.name || "",
      };
    } else if (user.role === "teacher") {
      const teacherSubjectIds: string[] = user.teacher_subject || [];

      const { count: myClassesCount, data: teacherClasses } = await supabaseAdmin
        .from("classes")
        .select("id", { count: "exact" })
        .eq("class_teacher", user.id);
      const classIds = (teacherClasses || []).map((item: any) => item.id);

      const [{ count: myStudentsCount }, { count: resultsEntered }] = await Promise.all([
        classIds.length > 0
          ? supabaseAdmin
              .from("users")
              .select("*", { count: "exact", head: true })
              .eq("role", "student")
              .in("student_class", classIds)
          : supabaseAdmin.from("users").select("*", { count: "exact", head: true }).eq("id", ""),
        teacherSubjectIds.length > 0
          ? currentYear?.id
            ? supabaseAdmin
                .from("results")
                .select("*", { count: "exact", head: true })
                .in("subject_id", teacherSubjectIds)
                .eq("academic_year_id", currentYear.id)
            : supabaseAdmin
                .from("results")
                .select("*", { count: "exact", head: true })
                .in("subject_id", teacherSubjectIds)
          : supabaseAdmin.from("results").select("*", { count: "exact", head: true }).eq("id", ""),
      ]);

      let totalRegistrations = 0;
      if (classIds.length > 0) {
        let query = supabaseAdmin
          .from("course_registrations")
          .select("*", { count: "exact", head: true })
          .in("class_id", classIds);

        if (currentYear?.id) {
          query = query.eq("academic_year_id", currentYear.id);
        }

        const { count } = await query;
        totalRegistrations = count || 0;
      }

      stats = {
        myClassesCount: myClassesCount || 0,
        mySubjectsCount: teacherSubjectIds.length || 0,
        totalStudents: myStudentsCount || 0,
        resultsEntered: resultsEntered || 0,
        pendingRegistrations: totalRegistrations,
        currentAcademicYear: currentYear?.name || "",
      };
    } else if (user.role === "student") {
      const { data: studentProfile } = await supabaseAdmin
        .from("users")
        .select("student_class")
        .eq("id", user.id)
        .single();

      let classInfo: { name?: string; subjects?: string[] } | null = null;
      if (studentProfile?.student_class) {
        const { data: studentClass } = await supabaseAdmin
          .from("classes")
          .select("name, subjects")
          .eq("id", studentProfile.student_class)
          .single();
        classInfo = studentClass;
      }

      let registration:
        | { status?: string; subject_ids?: string[] }
        | null
        | undefined = null;
      if (currentYear?.id) {
        const { data } = await supabaseAdmin
          .from("course_registrations")
          .select("status, subject_ids")
          .eq("student_id", user.id)
          .eq("academic_year_id", currentYear.id)
          .maybeSingle();
        registration = data;
      }

      let publishedResultsCount = 0;
      {
        let query = supabaseAdmin
          .from("results")
          .select("*", { count: "exact", head: true })
          .eq("student_id", user.id)
          .eq("result_status", "published");
        if (currentYear?.id) {
          query = query.eq("academic_year_id", currentYear.id);
        }
        const { count } = await query;
        publishedResultsCount = count || 0;
      }

      const registeredCoursesCount = registration?.subject_ids?.length || 0;

      stats = {
        totalSubjects: registeredCoursesCount || classInfo?.subjects?.length || 0,
        registrationStatus: registration ? "approved" : "not_submitted",
        availableCourses: classInfo?.subjects?.length || 0,
        publishedResultsCount,
        currentAcademicYear: currentYear?.name || "",
        studentClassName: classInfo?.name || "",
      };
    }
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};
