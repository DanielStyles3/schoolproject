import { type Request, type Response } from "express";
import { supabaseAdmin } from "../config/supabase.ts";

const normalizeDate = (value: string | Date) =>
  value instanceof Date ? value.toISOString() : new Date(value).toISOString();

const clearCurrentAcademicYear = async () => {
  const { error } = await supabaseAdmin
    .from("academic_years")
    .update({ is_current: false })
    .eq("is_current", true);

  if (error) {
    throw new Error(error.message);
  }
};

export const createAcademicYear = async (req: Request, res: Response) => {
  try {
    const { name, fromYear, toYear, isCurrent } = req.body;

    if (isCurrent) {
      await clearCurrentAcademicYear();
    }

    const { data, error } = await supabaseAdmin
      .from("academic_years")
      .insert({
        name,
        from_year: normalizeDate(fromYear),
        to_year: normalizeDate(toYear),
        is_current: isCurrent,
      })
      .select()
      .single();

    if (error) {
      res.status(400).json({ message: error.message });
      return;
    }

    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const getCurrentAcademicYear = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("academic_years")
      .select("*")
      .eq("is_current", true)
      .single();

    if (error) {
      res.status(404).json({ message: "No current academic year found" });
      return;
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const getAllAcademicYears = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search as string;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabaseAdmin
      .from("academic_years")
      .select("*", { count: "exact" });

    if (search) {
      query = query.ilike("name", `%${search}%`);
    }

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      res.status(500).json({ message: error.message });
      return;
    }

    res.json({
      years: data,
      pagination: {
        total: count || 0,
        page,
        pages: Math.ceil((count || 0) / limit),
        limit,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const updateAcademicYear = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, fromYear, toYear, isCurrent } = req.body;

    if (!id) {
      res.status(400).json({ message: "Academic year ID is required" });
      return;
    }

    if (isCurrent) {
      await clearCurrentAcademicYear();
    }

    const { data, error } = await supabaseAdmin
      .from("academic_years")
      .update({
        name,
        from_year: normalizeDate(fromYear),
        to_year: normalizeDate(toYear),
        is_current: isCurrent,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      res.status(400).json({ message: error.message });
      return;
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const deleteAcademicYear = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from("academic_years")
      .delete()
      .eq("id", id);

    if (error) {
      res.status(400).json({ message: error.message });
      return;
    }

    res.json({ message: "Academic year deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
