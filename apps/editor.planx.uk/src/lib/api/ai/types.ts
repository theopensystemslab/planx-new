export interface EnhanceResponse {
  original: string;
  enhanced: string;
}

export interface EnhanceError {
  error: "INVALID" | "ERROR" | "TOO_MANY_REQUESTS";
  message: string;
}
