import { supabaseAdmin } from "../config/supabase.ts";

export const syncTeacherAssignmentsForSubject = async (
  subjectId: string,
  teacherIds: string[],
) => {
  const { data: teachers, error } = await supabaseAdmin
    .from("users")
    .select("id, teacher_subject")
    .eq("role", "teacher");

  if (error || !teachers) {
    throw new Error(error?.message || "Failed to load teachers");
  }

  await Promise.all(
    teachers.map(async (teacher: any) => {
      const currentSubjects: string[] = teacher.teacher_subject || [];
      const shouldHaveSubject = teacherIds.includes(teacher.id);
      const alreadyHasSubject = currentSubjects.includes(subjectId);

      if (shouldHaveSubject === alreadyHasSubject) {
        return;
      }

      const nextSubjects = shouldHaveSubject
        ? Array.from(new Set([...currentSubjects, subjectId]))
        : currentSubjects.filter((id) => id !== subjectId);

      const { error: updateError } = await supabaseAdmin
        .from("users")
        .update({ teacher_subject: nextSubjects })
        .eq("id", teacher.id);

      if (updateError) {
        throw new Error(updateError.message);
      }
    }),
  );
};

export const syncSubjectAssignmentsForTeacher = async (
  teacherId: string,
  subjectIds: string[],
) => {
  const { data: subjects, error } = await supabaseAdmin
    .from("subjects")
    .select("id, teacher");

  if (error || !subjects) {
    throw new Error(error?.message || "Failed to load subjects");
  }

  await Promise.all(
    subjects.map(async (subject: any) => {
      const currentTeachers: string[] = subject.teacher || [];
      const shouldHaveTeacher = subjectIds.includes(subject.id);
      const alreadyHasTeacher = currentTeachers.includes(teacherId);

      if (shouldHaveTeacher === alreadyHasTeacher) {
        return;
      }

      const nextTeachers = shouldHaveTeacher
        ? Array.from(new Set([...currentTeachers, teacherId]))
        : currentTeachers.filter((id) => id !== teacherId);

      const { error: updateError } = await supabaseAdmin
        .from("subjects")
        .update({ teacher: nextTeachers })
        .eq("id", subject.id);

      if (updateError) {
        throw new Error(updateError.message);
      }
    }),
  );
};
