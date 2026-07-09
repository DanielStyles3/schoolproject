import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const DEMO_PASSWORD = process.env.DEMO_PASSWORD || "ChangeMe123!";

type DemoUser = {
  name: string;
  email: string;
  role: "admin" | "teacher" | "student";
};

const demoUsers: DemoUser[] = [
  { name: "System Admin", email: "admin@yabatech.local", role: "admin" },
  { name: "Mrs Adebayo", email: "teacher@yabatech.local", role: "teacher" },
  { name: "Demo Student", email: "student@yabatech.local", role: "student" },
  { name: "Amina Yusuf", email: "amina@yabatech.local", role: "student" },
];

const subjectSeeds = [
  { name: "Introduction to Computing", code: "CSC101", unit: 3 },
  { name: "Programming Fundamentals", code: "CSC102", unit: 3 },
  { name: "Elementary Mathematics", code: "MTH101", unit: 3 },
  { name: "Communication in English", code: "GST111", unit: 2 },
];

const ensureUser = async (user: DemoUser) => {
  const { data: existingProfile } = await supabase
    .from("users")
    .select("id")
    .eq("email", user.email)
    .maybeSingle();

  let userId = existingProfile?.id;

  if (userId) {
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      email: user.email,
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: { name: user.name, role: user.role },
    });

    if (error) {
      throw new Error(`Failed to update auth user ${user.email}: ${error.message}`);
    }
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: { name: user.name, role: user.role },
    });

    if (error || !data.user?.id) {
      throw new Error(`Failed to create auth user ${user.email}: ${error?.message}`);
    }

    userId = data.user.id;
  }

  const { error: profileError } = await supabase.from("users").upsert(
    {
      id: userId,
      name: user.name,
      email: user.email,
      role: user.role,
      teacher_subject: [],
    },
    { onConflict: "id" },
  );

  if (profileError) {
    throw new Error(`Failed to upsert profile ${user.email}: ${profileError.message}`);
  }

  return userId;
};

const ensureAcademicYear = async () => {
  const payload = {
    name: "2025/2026",
    from_year: "2025-09-01T00:00:00.000Z",
    to_year: "2026-08-31T23:59:59.000Z",
    is_current: true,
  };

  await supabase.from("academic_years").update({ is_current: false }).eq("is_current", true);

  const { data: existing } = await supabase
    .from("academic_years")
    .select("id")
    .eq("name", payload.name)
    .maybeSingle();

  if (existing?.id) {
    const { error } = await supabase
      .from("academic_years")
      .update(payload)
      .eq("id", existing.id);

    if (error) {
      throw new Error(`Failed to update academic year: ${error.message}`);
    }

    return existing.id;
  }

  const { data, error } = await supabase
    .from("academic_years")
    .insert(payload)
    .select("id")
    .single();

  if (error || !data?.id) {
    throw new Error(`Failed to create academic year: ${error?.message}`);
  }

  return data.id;
};

const ensureSubjects = async (teacherId: string) => {
  const subjectIds: string[] = [];

  for (const subject of subjectSeeds) {
    const { data: existing } = await supabase
      .from("subjects")
      .select("id")
      .eq("code", subject.code)
      .maybeSingle();

    if (existing?.id) {
      const { error } = await supabase
        .from("subjects")
        .update({
          ...subject,
          teacher: [teacherId],
          is_active: true,
        })
        .eq("id", existing.id);

      if (error) {
        throw new Error(`Failed to update subject ${subject.code}: ${error.message}`);
      }

      subjectIds.push(existing.id);
      continue;
    }

    const { data, error } = await supabase
      .from("subjects")
      .insert({
        ...subject,
        teacher: [teacherId],
        is_active: true,
      })
      .select("id")
      .single();

    if (error || !data?.id) {
      throw new Error(`Failed to create subject ${subject.code}: ${error?.message}`);
    }

    subjectIds.push(data.id);
  }

  const { error: teacherError } = await supabase
    .from("users")
    .update({ teacher_subject: subjectIds })
    .eq("id", teacherId);

  if (teacherError) {
    throw new Error(`Failed to update teacher assignment: ${teacherError.message}`);
  }

  return subjectIds;
};

const ensureClass = async (academicYearId: string, teacherId: string, subjectIds: string[]) => {
  const className = "ND I Computer Science";

  const { data: existing } = await supabase
    .from("classes")
    .select("id")
    .eq("name", className)
    .eq("academic_year", academicYearId)
    .maybeSingle();

  const payload = {
    name: className,
    academic_year: academicYearId,
    class_teacher: teacherId,
    subjects: subjectIds,
    capacity: 60,
  };

  if (existing?.id) {
    const { error } = await supabase.from("classes").update(payload).eq("id", existing.id);

    if (error) {
      throw new Error(`Failed to update class: ${error.message}`);
    }

    return existing.id;
  }

  const { data, error } = await supabase
    .from("classes")
    .insert(payload)
    .select("id")
    .single();

  if (error || !data?.id) {
    throw new Error(`Failed to create class: ${error?.message}`);
  }

  return data.id;
};

const assignStudentToClass = async (studentId: string, classId: string, name: string, email: string) => {
  const { error } = await supabase
    .from("users")
    .update({
      name,
      email,
      role: "student",
      student_class: classId,
      teacher_subject: [],
    })
    .eq("id", studentId);

  if (error) {
    throw new Error(`Failed to assign ${email} to class: ${error.message}`);
  }
};

const ensureRegistration = async (
  studentId: string,
  classId: string,
  academicYearId: string,
  subjectIds: string[],
  status: "submitted" | "approved",
) => {
  const { error } = await supabase.from("course_registrations").upsert(
    {
      student_id: studentId,
      class_id: classId,
      academic_year_id: academicYearId,
      subject_ids: subjectIds,
      status,
    },
    { onConflict: "student_id,academic_year_id" },
  );

  if (error) {
    throw new Error(`Failed to upsert registration for ${studentId}: ${error.message}`);
  }
};

const ensureResult = async (
  studentId: string,
  classId: string,
  academicYearId: string,
  subjectId: string,
  caScore: number,
  examScore: number,
) => {
  const totalScore = caScore + examScore;
  const unit = subjectSeeds.find((subject) => subject.code === "GST111" && subjectId)?.unit;

  const gradeInfo =
    totalScore >= 70
      ? { grade: "A", remark: "Excellent", point: 5 }
      : totalScore >= 60
        ? { grade: "B", remark: "Very Good", point: 4 }
        : totalScore >= 50
          ? { grade: "C", remark: "Good", point: 3 }
          : totalScore >= 45
            ? { grade: "D", remark: "Fair", point: 2 }
            : totalScore >= 40
              ? { grade: "E", remark: "Pass", point: 1 }
              : { grade: "F", remark: "Fail", point: 0 };

  const { data: subject, error: subjectError } = await supabase
    .from("subjects")
    .select("unit")
    .eq("id", subjectId)
    .single();

  if (subjectError) {
    throw new Error(`Failed to load subject ${subjectId}: ${subjectError.message}`);
  }

  const subjectUnit = Number(subject?.unit || unit || 0);

  const { error } = await supabase.from("results").upsert(
    {
      student_id: studentId,
      subject_id: subjectId,
      class_id: classId,
      academic_year_id: academicYearId,
      ca_score: caScore,
      exam_score: examScore,
      total_score: totalScore,
      grade: gradeInfo.grade,
      remark: gradeInfo.remark,
      quality_points: gradeInfo.point * subjectUnit,
    },
    { onConflict: "student_id,subject_id,academic_year_id" },
  );

  if (error) {
    throw new Error(`Failed to upsert result for ${studentId}: ${error.message}`);
  }
};

const cleanupLegacyDemoStudent = async () => {
  const { data: stray } = await supabase
    .from("users")
    .select("id, email")
    .eq("email", "student1818720625@example.com")
    .maybeSingle();

  if (!stray?.id) {
    return;
  }

  const { error } = await supabase.auth.admin.deleteUser(stray.id);
  if (error) {
    throw new Error(`Failed to remove legacy test student: ${error.message}`);
  }
};

const main = async () => {
  console.log("Seeding demo data...");

  const academicYearId = await ensureAcademicYear();
  const adminId = await ensureUser(demoUsers[0]);
  const teacherId = await ensureUser(demoUsers[1]);
  const firstStudentId = await ensureUser(demoUsers[2]);
  const secondStudentId = await ensureUser(demoUsers[3]);
  const subjectIds = await ensureSubjects(teacherId);
  const classId = await ensureClass(academicYearId, teacherId, subjectIds);

  await assignStudentToClass(firstStudentId, classId, demoUsers[2].name, demoUsers[2].email);
  await assignStudentToClass(secondStudentId, classId, demoUsers[3].name, demoUsers[3].email);

  await ensureRegistration(firstStudentId, classId, academicYearId, subjectIds, "approved");
  await ensureRegistration(
    secondStudentId,
    classId,
    academicYearId,
    subjectIds.slice(0, 3),
    "submitted",
  );

  await ensureResult(firstStudentId, classId, academicYearId, subjectIds[0], 28, 55);
  await ensureResult(firstStudentId, classId, academicYearId, subjectIds[1], 26, 48);
  await ensureResult(firstStudentId, classId, academicYearId, subjectIds[2], 24, 42);
  await ensureResult(firstStudentId, classId, academicYearId, subjectIds[3], 18, 45);

  await cleanupLegacyDemoStudent();

  console.log("Demo data ready.");
  console.log(`Admin: ${demoUsers[0].email}`);
  console.log(`Teacher: ${demoUsers[1].email}`);
  console.log(`Student: ${demoUsers[2].email}`);
  console.log(`Pending student: ${demoUsers[3].email}`);
  console.log(`Shared password: ${DEMO_PASSWORD}`);
  console.log(`Academic year: 2025/2026`);
  console.log(`Class: ND I Computer Science`);
  console.log(`Subjects: ${subjectSeeds.map((subject) => subject.code).join(", ")}`);
  console.log(`Admin ID: ${adminId}`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
