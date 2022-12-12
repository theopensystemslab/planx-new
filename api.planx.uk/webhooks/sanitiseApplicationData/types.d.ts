export interface OperationResult {
  operationName: string;
  result: "success" | "failure";
  count?: number;
  errorMessage?: string;
};

export type QueryResult = string[];

export type Operation = () => Promise<QueryResult>;