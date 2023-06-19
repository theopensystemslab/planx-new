import { stringify } from "csv-stringify";
import { NextFunction, Request, Response } from "express";
import { $admin } from "../../client";

export const getCSVData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await $admin.generateCSVData(req.params.sessionId);

    if (req.query?.download) {
      stringify(data, { 
        columns: ["question", "responses", "metadata"],
        header: true 
      }).pipe(res);
      res.header("Content-type", "text/csv");
      res.attachment(`${req.params.sessionId}.csv`);
    } else {
      res.send(data);
    }
  } catch (error) {
    return next({ message: "Failed to make CSV data: " + (error as Error).message });
  }
};
