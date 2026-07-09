import express, { type Request, type Response, type NextFunction } from "express";
import { supabaseAdmin } from "../config/supabase.ts";
import {
  register,
  login,
  logoutUser,
  getUserProfile,
  getUsers,
  updateUser,
  deleteUser,
  forgotPassword,
  updateOwnProfile,
} from "../controllers/user.ts";
import { protect, authorize } from "../middleware/auth.ts";
import validate from "../middleware/validate.ts";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  updateProfileSchema,
} from "../middleware/validationSchemas.ts";

const userRoutes = express.Router();

const checkBootstrap = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { count, error } = await supabaseAdmin
      .from("users")
      .select("*", { count: "exact", head: true });

    if (!error && count === 0) {
      return next();
    }
  } catch (err) {
    // Fallback to normal behavior
  }

  protect(req as any, res, () => {
    authorize(["admin", "teacher"])(req as any, res, next);
  });
};

userRoutes.post(
  "/register",
  checkBootstrap,
  validate(registerSchema),
  register
);
userRoutes.post("/login", validate(loginSchema), login);
userRoutes.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
userRoutes.post("/logout", logoutUser);
userRoutes.get("/profile", protect, getUserProfile);
userRoutes.put("/profile", protect, validate(updateProfileSchema), updateOwnProfile);
userRoutes.get("/", protect, authorize(["admin", "teacher"]), getUsers);
userRoutes.put("/update/:id", protect, authorize(["admin", "teacher"]), updateUser);
userRoutes.delete("/delete/:id", protect, authorize(["admin"]), deleteUser);

export default userRoutes;

