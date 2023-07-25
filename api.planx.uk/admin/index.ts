import { NextFunction, Request, Response } from "express";

export async function getTableOfContents(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    res.sendFile(__dirname + "/index.html");
  } catch (error) {
    return next({
      message:
        "Failed to connect to admin endpoint: " + (error as Error).message,
    });
  }
}
