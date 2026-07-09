import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const toStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item)).filter(Boolean);
};

const getCaller = async (request: Request) => {
  const authHeader = request.headers.get("Authorization") || "";
  const token = authHeader.replace("Bearer ", "").trim();
  if (!token) throw new Error("Missing authorization token");

  const userClient = createClient(supabaseUrl, serviceRoleKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: authData, error: authError } = await userClient.auth.getUser(token);
  if (authError || !authData.user) throw new Error("Invalid authorization token");

  const { data: profile, error: profileError } = await adminClient
    .from("users")
    .select("*")
    .eq("id", authData.user.id)
    .maybeSingle();

  if (profileError || !profile) throw new Error("Caller profile not found");
  return profile;
};

const requireAdmin = (caller: any) => {
  if (caller.role !== "admin") throw new Error("Only admins can manage users");
};

const syncClassMembership = async (userId: string, previousClassId: string | null, nextClassId: string | null) => {
  const classIds = Array.from(new Set([previousClassId, nextClassId].filter(Boolean))) as string[];
  if (classIds.length === 0) return;

  const { data: classes, error } = await adminClient.from("classes").select("id, students").in("id", classIds);
  if (error) throw error;

  await Promise.all((classes || []).map(async (row: any) => {
    const current = Array.isArray(row.students) ? row.students : [];
    const shouldInclude = row.id === nextClassId;
    const students = shouldInclude
      ? Array.from(new Set([...current, userId]))
      : current.filter((id: string) => id !== userId);

    const { error: updateError } = await adminClient.from("classes").update({ students }).eq("id", row.id);
    if (updateError) throw updateError;
  }));
};

const syncTeacherSubjects = async (teacherId: string, subjectIds: string[]) => {
  const { data: subjects, error } = await adminClient.from("subjects").select("id, teacher");
  if (error) throw error;

  await Promise.all((subjects || []).map(async (row: any) => {
    const current = Array.isArray(row.teacher) ? row.teacher : [];
    const shouldInclude = subjectIds.includes(row.id);
    const teacher = shouldInclude
      ? Array.from(new Set([...current, teacherId]))
      : current.filter((id: string) => id !== teacherId);

    const { error: updateError } = await adminClient.from("subjects").update({ teacher }).eq("id", row.id);
    if (updateError) throw updateError;
  }));
};

const publicUser = (row: any) => ({
  _id: row.id,
  name: row.name,
  email: row.email,
  role: row.role,
  studentClass: row.student_class,
  teacherSubjects: row.teacher_subject || [],
});

serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ message: "Method not allowed" }, 405);
  if (!supabaseUrl || !serviceRoleKey) return json({ message: "Supabase service environment is not configured" }, 500);

  try {
    const caller = await getCaller(request);
    const body = await request.json();
    const action = String(body.action || "");

    if (["create", "update", "delete"].includes(action)) requireAdmin(caller);

    if (action === "create") {
      const role = ["admin", "teacher", "student"].includes(body.role) ? body.role : "student";
      const email = String(body.email || "").trim().toLowerCase();
      const password = String(body.password || "");
      const name = String(body.name || "").trim();
      if (!email || !password || !name) return json({ message: "Name, email, and password are required" }, 400);

      const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name, role },
      });
      if (authError || !authData.user) throw authError || new Error("Unable to create auth user");

      const teacherSubject = role === "teacher" ? toStringArray(body.teacherSubjects || body.teacherSubject) : [];
      const studentClass = role === "student" ? String(body.studentClass || body.classId || "") || null : null;

      const { data: profile, error: profileError } = await adminClient
        .from("users")
        .upsert({ id: authData.user.id, name, email, role, student_class: studentClass, teacher_subject: teacherSubject, is_active: true })
        .select("*")
        .single();
      if (profileError) throw profileError;

      if (studentClass) await syncClassMembership(authData.user.id, null, studentClass);
      if (role === "teacher") await syncTeacherSubjects(authData.user.id, teacherSubject);

      return json({ user: publicUser(profile), message: "User created successfully" }, 201);
    }

    if (action === "update") {
      const id = String(body.id || "");
      if (!id) return json({ message: "User id is required" }, 400);

      const { data: previous } = await adminClient.from("users").select("*").eq("id", id).maybeSingle();
      if (!previous) return json({ message: "User not found" }, 404);

      const role = ["admin", "teacher", "student"].includes(body.role) ? body.role : previous.role;
      const email = body.email ? String(body.email).trim().toLowerCase() : previous.email;
      const name = body.name ? String(body.name).trim() : previous.name;
      const teacherSubject = role === "teacher" ? toStringArray(body.teacherSubjects || body.teacherSubject) : [];
      const studentClass = role === "student" ? String(body.studentClass || body.classId || "") || null : null;

      const authPayload: Record<string, unknown> = { email, user_metadata: { name, role } };
      if (body.password) authPayload.password = String(body.password);
      const { error: authError } = await adminClient.auth.admin.updateUserById(id, authPayload);
      if (authError) throw authError;

      const { data: profile, error: profileError } = await adminClient
        .from("users")
        .update({ name, email, role, student_class: studentClass, teacher_subject: teacherSubject })
        .eq("id", id)
        .select("*")
        .single();
      if (profileError) throw profileError;

      await syncClassMembership(id, previous.student_class, studentClass);
      if (previous.role === "teacher" || role === "teacher") await syncTeacherSubjects(id, teacherSubject);

      return json({ user: publicUser(profile), message: "User updated successfully" });
    }

    if (action === "delete") {
      const id = String(body.id || "");
      if (!id) return json({ message: "User id is required" }, 400);
      const { data: previous } = await adminClient.from("users").select("*").eq("id", id).maybeSingle();
      if (previous?.student_class) await syncClassMembership(id, previous.student_class, null);
      if (previous?.role === "teacher") await syncTeacherSubjects(id, []);
      const { error } = await adminClient.auth.admin.deleteUser(id);
      if (error) throw error;
      return json({ message: "User deleted successfully" });
    }

    if (action === "update-own-profile") {
      const name = String(body.name || caller.name || "").trim();
      const email = body.email ? String(body.email).trim().toLowerCase() : caller.email;
      const authPayload: Record<string, unknown> = { email, user_metadata: { name, role: caller.role } };
      if (body.password) authPayload.password = String(body.password);

      const { error: authError } = await adminClient.auth.admin.updateUserById(caller.id, authPayload);
      if (authError) throw authError;

      const { data: profile, error: profileError } = await adminClient
        .from("users")
        .update({ name, email })
        .eq("id", caller.id)
        .select("*")
        .single();
      if (profileError) throw profileError;

      return json({ user: publicUser(profile), message: "Profile updated successfully" });
    }

    return json({ message: "Unsupported admin user action" }, 404);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Request failed";
    const status = message.includes("Only admins") || message.includes("authorization") ? 403 : 400;
    return json({ message }, status);
  }
});
