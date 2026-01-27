export interface EnhanceResponse {
  original: string;
  enhanced: string;
}

export interface EnhanceError {
  error:
    | "INVALID_INPUT"
    | "GATEWAY_ERROR"
    | "SERVER_ERROR"
    | "TOO_MANY_REQUESTS"
    | "GUARDRAIL_TRIPPED";
  message: string;
}
