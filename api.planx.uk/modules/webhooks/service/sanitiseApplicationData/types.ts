import { z } from "zod";
import { ValidatedRequestHandler } from "../../../../shared/middleware/validate";

export interface OperationResult {
  operationName: string;
  status: "processing" | "success" | "failure";
  count?: number;
  errorMessage?: string;
}

export type QueryResult = string[] | string;

export type Operation = () => Promise<QueryResult>;

export type SanitiseApplicationData = ValidatedRequestHandler<
  z.ZodUndefined,
  OperationResult[]
>;
