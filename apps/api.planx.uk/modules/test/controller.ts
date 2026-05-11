import type { RequestHandler } from "express";

export const testSessionMethods: RequestHandler = (req, res) => {
  const hasRegenerate = typeof req.session?.regenerate === "function";
  const hasSave = typeof req.session?.save === "function";
  res.status(200).json({ hasRegenerate, hasSave });
};

export const testAirbrake: RequestHandler = (_req, _res, next) => {
  next(new Error("Test Airbrake error - checking source maps are working"));
};
