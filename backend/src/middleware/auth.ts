import { type Request, type Response, type NextFunction } from "express";
import { supabaseAdmin } from "../config/supabase.ts";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role?: string;
    name?: string;
    student_class?: string;
    teacher_subject?: string[];
  };
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const token = req.headers.authorization?.split(" ")[1] || req.cookies?.jwt;

  if (token) {
    try {
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

      if (error || !user) {
        res.status(401).json({ message: "Not authorized, token failed" });
        return;
      }

      // Fetch full profile from users table
      const { data: profile } = await supabaseAdmin
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      req.user = {
        id: user.id,
        email: user.email || "",
        role: profile?.role || user.user_metadata?.role,
        name: profile?.name || user.user_metadata?.name,
        student_class: profile?.student_class,
        teacher_subject: profile?.teacher_subject,
      };
      next();
    } catch (error) {
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res
        .status(401)
        .json({ message: "Not authorized, user not found" });
    }

    if (!roles.includes(req.user.role || "")) {
      return res.status(403).json({
        message: `User role '${req.user.role}' is not authorized to access this route`,
      });
    }

    next();
  };
};