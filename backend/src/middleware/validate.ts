import { type Request, type Response, type NextFunction } from "express";
import { z } from "zod";

const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: result.error.flatten(),
      });
    }
    req.body = result.data;
    next();
  };
};

export default validate;
