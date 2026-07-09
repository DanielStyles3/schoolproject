import { type Request, type Response } from "express";
import { supabase, supabaseAdmin } from "../config/supabase.ts";
import { syncSubjectAssignmentsForTeacher } from "../utils/subjectAssignments.ts";

const isProduction =
  process.env.NODE_ENV === "production" || process.env.STAGE === "production";

const getClientUrl = () => {
  const configured = process.env.CLIENT_URL || "http://localhost:5173";
  return configured.split(",")[0]?.trim() || "http://localhost:5173";
};
const toStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item)).filter(Boolean);
};

const toStringValue = (value: unknown): string => {
  if (Array.isArray(value)) return String(value[0] || "");
  return value ? String(value) : "";
};

const buildUserPayload = async (userId: string, fallback?: Record<string, any>) => {
  const { data: profile, error } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !profile) {
    return {
      id: userId,
      name: fallback?.name || "",
      email: fallback?.email || "",
      role: fallback?.role || "",
      student_class: null,
      teacher_subject: [],
    };
  }

  let studentClass = null;
  if (profile.student_class) {
    const { data } = await supabaseAdmin
      .from("classes")
      .select("id, name")
      .eq("id", profile.student_class)
      .single();
    studentClass = data || null;
  }

  let teacherSubjects: any[] = [];
  if (profile.teacher_subject?.length) {
    const { data } = await supabaseAdmin
      .from("subjects")
      .select("id, name, code, unit, is_active")
      .in("id", profile.teacher_subject);
    teacherSubjects = data || [];
  }

  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    role: profile.role,
    student_class: studentClass,
    teacher_subject: teacherSubjects,
  };
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      email,
      password,
      role,
      studentClass,
      teacherSubject,
      teacherSubjects,
    } = req.body;
    const nextTeacherSubjects = toStringArray(teacherSubjects || teacherSubject);

    if (!name || !email || !password) {
      res.status(400).json({ message: "Name, email, and password are required" });
      return;
    }

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role },
    });

    if (error) {
      res.status(400).json({ message: error.message });
      return;
    }

    const { error: profileError } = await supabaseAdmin
      .from("users")
      .insert({
        id: data.user?.id,
        name,
        email,
        role,
        student_class: studentClass,
        teacher_subject: nextTeacherSubjects,
      });

    if (profileError) {
      res.status(400).json({ message: profileError.message });
      return;
    }

    if (role === "teacher" && data.user?.id) {
      await syncSubjectAssignmentsForTeacher(data.user.id, nextTeacherSubjects);
    }

    res.status(201).json({
      id: data.user?.id,
      name,
      email,
      role,
      message: "User registered successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    res.cookie("jwt", data.session.access_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "strict" : "lax",
      maxAge: data.session.expires_in * 1000,
    });

    const payload = await buildUserPayload(data.user.id, {
      email: data.user?.email,
      role: data.user?.user_metadata?.role,
      name: data.user?.user_metadata?.name,
    });

    res.json({
      user: payload,
      session: data.session,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search as string;
    const role = req.query.role as string;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabaseAdmin
      .from("users")
      .select("*, student_class:classes!student_class(*)", { count: "exact" });

    if (role) {
      query = query.eq("role", role);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data: users, error, count } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      res.status(500).json({ message: error.message });
      return;
    }

    const subjectIds = new Set<string>();
    users?.forEach((u: any) => {
      if (u.teacher_subject) {
        u.teacher_subject.forEach((sid: string) => subjectIds.add(sid));
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

    const mappedUsers = (users || []).map((u: any) => {
      const teacherSubjects = (u.teacher_subject || [])
        .map((sid: string) => subjectsMap[sid])
        .filter(Boolean);
      return {
        ...u,
        teacher_subject: teacherSubjects,
      };
    });

    res.json({
      users: mappedUsers,
      pagination: {
        total: count || 0,
        page,
        pages: Math.ceil((count || 0) / limit),
        limit,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    res.json({
      user: await buildUserPayload(user.id, user),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${getClientUrl()}/login`,
    });

    if (error) {
      res.status(400).json({ message: error.message });
      return;
    }

    res.json({
      message: "If that email exists, a password reset link has been sent.",
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const updateOwnProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const currentUser = (req as any).user;

    if (!currentUser?.id) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    const { name, email, password } = req.body;
    const authUpdatePayload: Record<string, unknown> = {
      email,
      user_metadata: {
        name,
        role: currentUser.role,
      },
    };

    if (password) {
      authUpdatePayload.password = password;
    }

    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      currentUser.id,
      authUpdatePayload
    );

    if (authError) {
      res.status(400).json({ message: authError.message });
      return;
    }

    const { error: profileError } = await supabaseAdmin
      .from("users")
      .update({
        name,
        email,
      })
      .eq("id", currentUser.id);

    if (profileError) {
      res.status(400).json({ message: profileError.message });
      return;
    }

    res.json({
      message: "Profile updated successfully",
      user: await buildUserPayload(currentUser.id, {
        ...currentUser,
        name,
        email,
      }),
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = toStringValue(req.params.id);
    if (!id) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }
    const { name, email, role, studentClass, teacherSubjects, password } = req.body;
    const nextTeacherSubjects = role === "teacher" ? toStringArray(teacherSubjects) : [];

    const authUpdatePayload: any = {};
    if (email) authUpdatePayload.email = email;
    if (password) authUpdatePayload.password = password;
    if (name || role) authUpdatePayload.user_metadata = { name, role };

    if (Object.keys(authUpdatePayload).length > 0) {
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
        id,
        authUpdatePayload
      );
      if (authError) {
        res.status(400).json({ message: authError.message });
        return;
      }
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("users")
      .update({
        name,
        email,
        role,
        student_class: studentClass || null,
        teacher_subject: nextTeacherSubjects,
      })
      .eq("id", id)
      .select()
      .single();

    if (profileError) {
      res.status(400).json({ message: profileError.message });
      return;
    }

    await syncSubjectAssignmentsForTeacher(id, nextTeacherSubjects);

    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = toStringValue(req.params.id);
    if (!id) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }

    const { data: profile } = await supabaseAdmin
      .from("users")
      .select("role, teacher_subject")
      .eq("id", id)
      .single();

    if (profile?.role === "teacher") {
      await syncSubjectAssignmentsForTeacher(id, []);
    }

    const { error } = await supabaseAdmin.auth.admin.deleteUser(id);

    if (error) {
      res.status(400).json({ message: error.message });
      return;
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const logoutUser = async (req: Request, res: Response) => {
  try {
    res.clearCookie("jwt");
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};




