export interface OperationResult {
  operationName: string;
  status: "processing" | "success" | "failure";
  count?: number;
  errorMessage?: string;
}
