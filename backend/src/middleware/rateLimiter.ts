import { type Request, type Response, type NextFunction } from "express";

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export const rateLimiter = (maxRequests: number, windowMs: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || req.socket.remoteAddress || "unknown";
    const now = Date.now();
    const record = rateLimitStore.get(key);

    if (record && now < record.resetTime) {
      record.count += 1;
      if (record.count > maxRequests) {
        return res.status(429).json({
          message: "Too many requests. Please try again later.",
        });
      }
    } else {
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
    }

    next();
  };
};

export const authRateLimiter = rateLimiter(10, 15 * 60 * 1000);
