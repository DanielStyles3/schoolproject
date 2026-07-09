import { supabaseAdmin } from "../config/supabase.ts";

export const logActivity = async ({
  userId,
  action,
  details,
}: {
  userId: string;
  action: string;
  details?: string;
}) => {
  try {
    await supabaseAdmin.from("activity_logs").insert({
      user_id: userId,
      action,
      details,
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
};
