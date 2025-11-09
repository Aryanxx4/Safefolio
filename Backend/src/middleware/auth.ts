import { Request, Response, NextFunction } from "express";

export function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated?.() && req.user) {
    return next();
  }
  return res.status(401).json({ error: "Unauthorized" });
}
