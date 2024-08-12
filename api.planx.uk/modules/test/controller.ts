import { RequestHandler } from "express";

export const testSessionMethods: RequestHandler = (req, res) => {
  const hasRegenerate = typeof req.session?.regenerate === "function";
  const hasSave = typeof req.session?.save === "function";
  res.status(200).json({ hasRegenerate, hasSave });
};
