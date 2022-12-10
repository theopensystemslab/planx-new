export interface OperationResult {
  operationName: string;
  result: "success" | "failure";
  deleteCount?: number;
  errorMessage?: string;
};

export type QueryResult = string[];

export type Operation = () => Promise<QueryResult>;