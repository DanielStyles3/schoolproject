import { supabase } from "@/lib/supabase";

type ApiResponse<T = any> = { data: T };
type QueryOptions = {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  classId?: string;
  academicYearId?: string;
};

const ok = <T>(data: T): ApiResponse<T> => ({ data });

const fail = (message: string, status = 400): never => {
  const error: any = new Error(message);
  error.response = { data: { message }, status };
  throw error;
};

const parsePath = (path: string) => {
  const [pathname, queryString = ""] = path.split("?");
  const params = Object.fromEntries(new URLSearchParams(queryString).entries()) as QueryOptions;
  return { pathname, params };
};

const pageRange = (params: QueryOptions) => {
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  return { page, limit, from, to };
};

const mapAcademicYear = (row: any) => row && ({
  _id: row.id,
  name: row.name,
  fromYear: row.from_year,
  toYear: row.to_year,
  isCurrent: row.is_current,
});

const mapUser = (row: any, extras: Record<string, any> = {}) => row && ({
  _id: row.id,
  name: row.name,
  email: row.email,
  role: row.role,
  studentClass: extras.studentClass,
  teacherSubjects: extras.teacherSubjects,
});

const mapSubject = (row: any, extras: Record<string, any> = {}) => row && ({
  _id: row.id,
  name: row.name,
  code: row.code,
  unit: row.unit,
  teacher: extras.teacher,
  isActive: row.is_active,
});

const mapClass = (row: any, extras: Record<string, any> = {}) => row && ({
  _id: row.id,
  name: row.name,
  academicYear: extras.academicYear,
  classTeacher: extras.classTeacher,
  subjects: extras.subjects || [],
  students: extras.students || [],
  capacity: row.capacity,
});

const mapRegistration = (row: any, extras: Record<string, any> = {}) => row && ({
  _id: row.id,
  student: extras.student,
  class: extras.class,
  academicYear: extras.academicYear,
  subjectIds: row.subject_ids || [],
  subjects: extras.subjects || [],
  status: row.status,
  updatedAt: row.updated_at,
});

const mapResult = (row: any, extras: Record<string, any> = {}) => row && ({
  _id: row.id,
  student: extras.student,
  subject: extras.subject,
  class: extras.class,
  academicYear: extras.academicYear,
  caScore: Number(row.ca_score || 0),
  examScore: Number(row.exam_score || 0),
  totalScore: Number(row.total_score || 0),
  qualityPoints: Number(row.quality_points || 0),
  grade: row.grade,
  remark: row.remark,
  resultStatus: row.result_status,
});

const getCurrentYear = async () => {
  const { data, error } = await supabase
    .from("academic_years")
    .select("*")
    .eq("is_current", true)
    .maybeSingle();

  if (error) fail(error.message);
  return data;
};

const getSessionProfile = async () => {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) fail("Not authorized", 401);
  const authUser = authData.user!;

  const { data: profile, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", authUser.id)
    .maybeSingle();

  if (error || !profile) fail(error?.message || "Profile not found", 401);
  return profile;
};

const fetchUsersByIds = async (ids: string[]) => {
  const uniqueIds = Array.from(new Set(ids.filter(Boolean)));
  if (uniqueIds.length === 0) return new Map<string, any>();

  const { data, error } = await supabase.from("users").select("*").in("id", uniqueIds);
  if (error) fail(error.message);
  return new Map((data || []).map((row: any) => [row.id, row]));
};

const fetchSubjectsByIds = async (ids: string[]) => {
  const uniqueIds = Array.from(new Set(ids.filter(Boolean)));
  if (uniqueIds.length === 0) return new Map<string, any>();

  const { data, error } = await supabase.from("subjects").select("*").in("id", uniqueIds);
  if (error) fail(error.message);
  return new Map((data || []).map((row: any) => [row.id, row]));
};

const fetchClassesByIds = async (ids: string[]) => {
  const uniqueIds = Array.from(new Set(ids.filter(Boolean)));
  if (uniqueIds.length === 0) return new Map<string, any>();

  const { data, error } = await supabase.from("classes").select("*").in("id", uniqueIds);
  if (error) fail(error.message);
  return new Map((data || []).map((row: any) => [row.id, row]));
};
const mapProfileUser = async (profile: any) => {
  const [classMap, subjectMap] = await Promise.all([
    fetchClassesByIds(profile.student_class ? [profile.student_class] : []),
    fetchSubjectsByIds(profile.teacher_subject || []),
  ]);

  return mapUser(profile, {
    studentClass: mapClass(classMap.get(profile.student_class)),
    teacherSubjects: (profile.teacher_subject || [])
      .map((id: string) => mapSubject(subjectMap.get(id)))
      .filter(Boolean),
  });
};

const gradeResult = (caScore: number, examScore: number, unit = 3) => {
  const totalScore = caScore + examScore;
  if (totalScore >= 70) return { totalScore, grade: "A", remark: "Excellent", qualityPoints: 5 * unit };
  if (totalScore >= 60) return { totalScore, grade: "B", remark: "Very Good", qualityPoints: 4 * unit };
  if (totalScore >= 50) return { totalScore, grade: "C", remark: "Good", qualityPoints: 3 * unit };
  if (totalScore >= 45) return { totalScore, grade: "D", remark: "Pass", qualityPoints: 2 * unit };
  if (totalScore >= 40) return { totalScore, grade: "E", remark: "Fair", qualityPoints: 1 * unit };
  return { totalScore, grade: "F", remark: "Fail", qualityPoints: 0 };
};

const listAcademicYears = async (params: QueryOptions = {}) => {
  const { page, limit, from, to } = pageRange(params);
  let query = supabase.from("academic_years").select("*", { count: "exact" });
  if (params.search) query = query.ilike("name", `%${params.search}%`);
  const { data, error, count } = await query.order("created_at", { ascending: false }).range(from, to);
  if (error) fail(error.message);
  return ok({ academicYears: (data || []).map(mapAcademicYear), pagination: { total: count || 0, page, pages: Math.ceil((count || 0) / limit), limit } });
};

const listUsers = async (params: QueryOptions = {}) => {
  const { page, limit, from, to } = pageRange(params);
  let query = supabase.from("users").select("*", { count: "exact" });
  if (params.role) query = query.eq("role", params.role);
  if (params.search) query = query.or(`name.ilike.%${params.search}%,email.ilike.%${params.search}%`);
  const { data, error, count } = await query.order("created_at", { ascending: false }).range(from, to);
  if (error) fail(error.message);

  const classMap = await fetchClassesByIds((data || []).map((u: any) => u.student_class).filter(Boolean));
  const subjectMap = await fetchSubjectsByIds((data || []).flatMap((u: any) => u.teacher_subject || []));
  const users = (data || []).map((u: any) => mapUser(u, {
    studentClass: mapClass(classMap.get(u.student_class)),
    teacherSubjects: (u.teacher_subject || []).map((id: string) => mapSubject(subjectMap.get(id))).filter(Boolean),
  }));

  return ok({ users, pagination: { total: count || 0, page, pages: Math.ceil((count || 0) / limit), limit } });
};

const listSubjects = async (params: QueryOptions = {}) => {
  const { page, limit, from, to } = pageRange(params);
  let query = supabase.from("subjects").select("*", { count: "exact" });
  if (params.search) query = query.or(`name.ilike.%${params.search}%,code.ilike.%${params.search}%`);
  const { data, error, count } = await query.order("created_at", { ascending: false }).range(from, to);
  if (error) fail(error.message);

  const teacherMap = await fetchUsersByIds((data || []).flatMap((s: any) => s.teacher || []));
  const subjects = (data || []).map((s: any) => mapSubject(s, {
    teacher: (s.teacher || []).map((id: string) => mapUser(teacherMap.get(id))).filter(Boolean),
  }));

  return ok({ subjects, pagination: { total: count || 0, page, pages: Math.ceil((count || 0) / limit), limit } });
};

const listClasses = async (params: QueryOptions = {}) => {
  const { page, limit, from, to } = pageRange(params);
  let query = supabase.from("classes").select("*", { count: "exact" });
  if (params.search) query = query.ilike("name", `%${params.search}%`);
  const { data, error, count } = await query.order("created_at", { ascending: false }).range(from, to);
  if (error) fail(error.message);

  const years = new Map<string, any>();
  const { data: yearRows } = await supabase.from("academic_years").select("*");
  (yearRows || []).forEach((row: any) => years.set(row.id, row));
  const teacherMap = await fetchUsersByIds((data || []).map((c: any) => c.class_teacher).filter(Boolean));
  const subjectMap = await fetchSubjectsByIds((data || []).flatMap((c: any) => c.subjects || []));
  const studentMap = await fetchUsersByIds((data || []).flatMap((c: any) => c.students || []));

  const classes = (data || []).map((c: any) => mapClass(c, {
    academicYear: mapAcademicYear(years.get(c.academic_year)),
    classTeacher: mapUser(teacherMap.get(c.class_teacher)),
    subjects: (c.subjects || []).map((id: string) => mapSubject(subjectMap.get(id))).filter(Boolean),
    students: (c.students || []).map((id: string) => mapUser(studentMap.get(id))).filter(Boolean),
  }));

  return ok({ classes, pagination: { total: count || 0, page, pages: Math.ceil((count || 0) / limit), limit } });
};

const getAvailableRegistration = async () => {
  const profile = await getSessionProfile();
  const currentYear = await getCurrentYear();
  if (!currentYear) fail("No active academic year found");
  if (!profile.student_class) fail("Student is not assigned to a class");

  const { data: classRow, error: classError } = await supabase.from("classes").select("*").eq("id", profile.student_class).maybeSingle();
  if (classError || !classRow) fail(classError?.message || "Class not found");

  const subjectMap = await fetchSubjectsByIds(classRow.subjects || []);
  const subjects = (classRow.subjects || []).map((id: string) => mapSubject(subjectMap.get(id))).filter((s: any) => s?.isActive);
  const { data: registration } = await supabase
    .from("course_registrations")
    .select("*")
    .eq("student_id", profile.id)
    .eq("academic_year_id", currentYear.id)
    .maybeSingle();

  return ok({
    student: mapUser(profile),
    class: mapClass(classRow),
    academicYear: mapAcademicYear(currentYear),
    subjects,
    registration: mapRegistration(registration, { subjects: (registration?.subject_ids || []).map((id: string) => subjectMap.get(id)).filter(Boolean).map(mapSubject) }),
  });
};

const listRegistrations = async (params: QueryOptions = {}) => {
  let query = supabase.from("course_registrations").select("*");
  if (params.classId) query = query.eq("class_id", params.classId);
  if (params.academicYearId) query = query.eq("academic_year_id", params.academicYearId);
  const { data, error } = await query.order("updated_at", { ascending: false });
  if (error) fail(error.message);

  const userMap = await fetchUsersByIds((data || []).map((r: any) => r.student_id));
  const classMap = await fetchClassesByIds((data || []).map((r: any) => r.class_id));
  const subjectMap = await fetchSubjectsByIds((data || []).flatMap((r: any) => r.subject_ids || []));
  const years = new Map<string, any>();
  const { data: yearRows } = await supabase.from("academic_years").select("*");
  (yearRows || []).forEach((row: any) => years.set(row.id, row));

  return ok({ registrations: (data || []).map((r: any) => mapRegistration(r, {
    student: mapUser(userMap.get(r.student_id)),
    class: mapClass(classMap.get(r.class_id)),
    academicYear: mapAcademicYear(years.get(r.academic_year_id)),
    subjects: (r.subject_ids || []).map((id: string) => mapSubject(subjectMap.get(id))).filter(Boolean),
  })) });
};

const listResults = async (params: QueryOptions = {}) => {
  const profile = await getSessionProfile();
  let query = supabase.from("results").select("*");
  if (params.classId) query = query.eq("class_id", params.classId);
  if (params.academicYearId) query = query.eq("academic_year_id", params.academicYearId);
  if (profile.role === "student") query = query.eq("student_id", profile.id).eq("result_status", "published");
  const { data, error } = await query.order("updated_at", { ascending: false });
  if (error) fail(error.message);

  const userMap = await fetchUsersByIds((data || []).map((r: any) => r.student_id));
  const subjectMap = await fetchSubjectsByIds((data || []).map((r: any) => r.subject_id));
  const classMap = await fetchClassesByIds((data || []).map((r: any) => r.class_id));
  const results = (data || []).map((r: any) => mapResult(r, {
    student: mapUser(userMap.get(r.student_id)),
    subject: mapSubject(subjectMap.get(r.subject_id)),
    class: mapClass(classMap.get(r.class_id)),
  }));

  if (profile.role === "student") {
    const totalUnits = results.reduce((sum: number, item: any) => sum + Number(item.subject?.unit || 0), 0);
    const totalQualityPoints = results.reduce((sum: number, item: any) => sum + Number(item.qualityPoints || 0), 0);
    return ok({ results, summary: { totalCourses: results.length, totalUnits, totalQualityPoints, gpa: totalUnits ? totalQualityPoints / totalUnits : 0 } });
  }

  return ok(results);
};

const dashboardStats = async () => {
  const profile = await getSessionProfile();
  const currentYear = await getCurrentYear();

  if (profile.role === "student") {
    const available = await getAvailableRegistration().catch(() => ({ data: { subjects: [], registration: null, class: null } }));
    const results = await listResults().catch(() => ({ data: { results: [] } } as ApiResponse<{ results: any[] }>));
    return ok({
      totalSubjects: available.data.registration?.subjectIds?.length || 0,
      availableCourses: available.data.subjects?.length || 0,
      publishedResultsCount: (Array.isArray(results.data) ? results.data.length : results.data.results?.length) || 0,
      registrationStatus: available.data.registration?.status || "not_submitted",
      currentAcademicYear: currentYear?.name,
      studentClassName: available.data.class?.name,
    });
  }

  const [{ count: students }, { count: teachers }, { count: classes }, { count: subjects }, { count: results }, { count: registrations }] = await Promise.all([
    supabase.from("users").select("id", { count: "exact", head: true }).eq("role", "student"),
    supabase.from("users").select("id", { count: "exact", head: true }).eq("role", "teacher"),
    supabase.from("classes").select("id", { count: "exact", head: true }),
    supabase.from("subjects").select("id", { count: "exact", head: true }),
    supabase.from("results").select("id", { count: "exact", head: true }),
    supabase.from("course_registrations").select("id", { count: "exact", head: true }),
  ]);

  if (profile.role === "teacher") {
    return ok({ myClassesCount: classes || 0, mySubjectsCount: profile.teacher_subject?.length || 0, totalStudents: students || 0, resultsEntered: results || 0, currentAcademicYear: currentYear?.name });
  }

  return ok({ totalStudents: students || 0, totalTeachers: teachers || 0, totalClasses: classes || 0, totalSubjects: subjects || 0, totalResults: results || 0, pendingRegistrations: registrations || 0, currentAcademicYear: currentYear?.name });
};

const callAdminUsersFunction = async (action: string, payload: Record<string, any>) => {
  const { data, error } = await supabase.functions.invoke("admin-users", { body: { action, ...payload } });
  if (error) fail(error.message || "Admin user function failed");
  return ok(data);
};

const apiGet = async (path: string): Promise<ApiResponse> => {
  const { pathname, params } = parsePath(path);
  if (pathname === "/users/profile") return ok({ user: await mapProfileUser(await getSessionProfile()) });
  if (pathname === "/users") return listUsers(params);
  if (pathname === "/academic-years/current") return ok(mapAcademicYear(await getCurrentYear()));
  if (pathname === "/academic-years") return listAcademicYears(params);
  if (pathname === "/classes") return listClasses(params);
  if (pathname === "/subjects" || pathname === "/courses") return listSubjects(params);
  if (pathname === "/course-registrations/available") return getAvailableRegistration();
  if (pathname === "/course-registrations") return listRegistrations(params);
  if (pathname === "/results") return listResults(params);
  if (pathname === "/dashboard/stats") return dashboardStats();
  return fail(`Unsupported Supabase API route: ${pathname}`, 404);
};

const apiPost = async (path: string, body: any = {}): Promise<ApiResponse> => {
  const { pathname } = parsePath(path);
  if (pathname === "/users/login") {
    const { data, error } = await supabase.auth.signInWithPassword({ email: body.email, password: body.password });
    if (error || !data.user) fail(error?.message || "Invalid email or password", 401);
    return ok({ user: mapUser(await getSessionProfile()), session: data.session });
  }
  if (pathname === "/users/logout") {
    await supabase.auth.signOut();
    return ok({ message: "Logged out successfully" });
  }
  if (pathname === "/users/forgot-password") {
    const { error } = await supabase.auth.resetPasswordForEmail(body.email, { redirectTo: `${window.location.origin}/login` });
    if (error) fail(error.message);
    return ok({ message: "If that email exists, a password reset link has been sent." });
  }
  if (pathname === "/users/register") return callAdminUsersFunction("create", body);
  if (pathname === "/academic-years/create") {
    if (body.isCurrent) await supabase.from("academic_years").update({ is_current: false }).neq("id", "00000000-0000-0000-0000-000000000000");
    const { data, error } = await supabase.from("academic_years").insert({ name: body.name, from_year: body.fromYear, to_year: body.toYear, is_current: body.isCurrent }).select("*").single();
    if (error) fail(error.message);
    return ok(mapAcademicYear(data));
  }
  if (pathname === "/classes/create") {
    const { data, error } = await supabase.from("classes").insert({ name: body.name, academic_year: body.academicYear, class_teacher: body.classTeacher || null, subjects: body.subjects || [], capacity: body.capacity || 40 }).select("*").single();
    if (error) fail(error.message);
    return ok(mapClass(data));
  }
  if (pathname === "/courses/create") {
    const teacherIds = body.teacher || [];
    const classIds = body.classIds || [];
    const { data, error } = await supabase.from("subjects").insert({ name: body.name, code: body.code, unit: body.unit || 3, teacher: teacherIds, is_active: body.isActive ?? true }).select("*").single();
    if (error) fail(error.message);
    await syncSubjectClassLinks(data.id, classIds);
    return ok(mapSubject(data));
  }
  if (pathname === "/course-registrations") {
    const available = await getAvailableRegistration();
    const payload = { student_id: available.data.student._id, class_id: available.data.class._id, academic_year_id: available.data.academicYear._id, subject_ids: body.subjectIds || [], status: "submitted" };
    const { data, error } = await supabase.from("course_registrations").upsert(payload, { onConflict: "student_id,academic_year_id" }).select("*").single();
    if (error) fail(error.message);
    return ok(mapRegistration(data));
  }
  if (pathname === "/results") {
    const { data: subject } = await supabase.from("subjects").select("*").eq("id", body.subjectId).maybeSingle();
    const computed = gradeResult(Number(body.caScore || 0), Number(body.examScore || 0), subject?.unit || 3);
    const payload = { student_id: body.studentId, subject_id: body.subjectId, class_id: body.classId, academic_year_id: body.academicYearId, ca_score: body.caScore, exam_score: body.examScore, ...snakeResult(computed), result_status: "draft" };
    const { data, error } = await supabase.from("results").upsert(payload, { onConflict: "student_id,subject_id,academic_year_id" }).select("*").single();
    if (error) fail(error.message);
    return ok(mapResult(data));
  }
  return fail(`Unsupported Supabase API route: ${pathname}`, 404);
};

const snakeResult = (computed: any) => ({ total_score: computed.totalScore, grade: computed.grade, remark: computed.remark, quality_points: computed.qualityPoints });

const syncSubjectClassLinks = async (subjectId: string, classIds: string[]) => {
  const { data: classes, error } = await supabase.from("classes").select("id, subjects");
  if (error) fail(error.message);
  await Promise.all((classes || []).map(async (row: any) => {
    const current = row.subjects || [];
    const shouldInclude = classIds.includes(row.id);
    const next = shouldInclude ? Array.from(new Set([...current, subjectId])) : current.filter((id: string) => id !== subjectId);
    if (JSON.stringify(current) !== JSON.stringify(next)) {
      const { error: updateError } = await supabase.from("classes").update({ subjects: next }).eq("id", row.id);
      if (updateError) fail(updateError.message);
    }
  }));
};

const apiPatch = async (path: string, body: any = {}): Promise<ApiResponse> => {
  const { pathname } = parsePath(path);
  if (pathname.startsWith("/courses/update/")) {
    const id = pathname.split("/").pop() || "";
    const { data, error } = await supabase.from("subjects").update({ name: body.name, code: body.code, unit: body.unit || 3, teacher: body.teacher || [], is_active: body.isActive }).eq("id", id).select("*").single();
    if (error) fail(error.message);
    await syncSubjectClassLinks(id, body.classIds || []);
    return ok(mapSubject(data));
  }
  if (pathname.startsWith("/academic-years/update/")) {
    const id = pathname.split("/").pop() || "";
    if (body.isCurrent) await supabase.from("academic_years").update({ is_current: false }).neq("id", id);
    const { data, error } = await supabase.from("academic_years").update({ name: body.name, from_year: body.fromYear, to_year: body.toYear, is_current: body.isCurrent }).eq("id", id).select("*").single();
    if (error) fail(error.message);
    return ok(mapAcademicYear(data));
  }
  if (pathname.startsWith("/course-registrations/") && pathname.endsWith("/status")) {
    const id = pathname.split("/")[2] || "";
    const status = body.status === "approved" ? "approved" : "submitted";
    const { data, error } = await supabase.from("course_registrations").update({ status }).eq("id", id).select("*").single();
    if (error) fail(error.message);
    if (!data) fail("Registration not found, or you do not have permission to update it", 403);
    return ok(mapRegistration(data));
  }
  if (pathname === "/results/publish") {
    let query = supabase.from("results").update({ result_status: "published" }).eq("subject_id", body.subjectId);
    if (body.classId) query = query.eq("class_id", body.classId);
    if (body.academicYearId) query = query.eq("academic_year_id", body.academicYearId);
    const { error } = await query;
    if (error) fail(error.message);
    return ok({ message: "Results published successfully" });
  }
  return fail(`Unsupported Supabase API route: ${pathname}`, 404);
};

const apiPut = async (path: string, body: any = {}): Promise<ApiResponse> => {
  const { pathname } = parsePath(path);
  if (pathname === "/users/profile") return callAdminUsersFunction("update-own-profile", body);
  if (pathname.startsWith("/users/update/")) return callAdminUsersFunction("update", { id: pathname.split("/").pop(), ...body });
  if (pathname.startsWith("/classes/update/")) {
    const id = pathname.split("/").pop() || "";
    const { data, error } = await supabase.from("classes").update({ name: body.name, academic_year: body.academicYear, class_teacher: body.classTeacher || null, subjects: body.subjects || [], capacity: body.capacity || 40 }).eq("id", id).select("*").single();
    if (error) fail(error.message);
    return ok(mapClass(data));
  }
  return apiPatch(path, body);
};

const apiDelete = async (path: string): Promise<ApiResponse> => {
  const { pathname } = parsePath(path);
  const id = pathname.split("/").pop() || "";
  if (pathname.startsWith("/users/delete/")) return callAdminUsersFunction("delete", { id });
  if (pathname.startsWith("/classes/delete/")) return ok(await supabase.from("classes").delete().eq("id", id));
  if (pathname.startsWith("/courses/delete/")) return ok(await supabase.from("subjects").delete().eq("id", id));
  if (pathname.startsWith("/academic-years/delete/")) return ok(await supabase.from("academic_years").delete().eq("id", id));
  return fail(`Unsupported Supabase API route: ${pathname}`, 404);
};

export const api = {
  get: apiGet,
  post: apiPost,
  put: apiPut,
  patch: apiPatch,
  delete: apiDelete,
  interceptors: {
    request: { use: () => undefined },
    response: { use: () => undefined },
  },
};


