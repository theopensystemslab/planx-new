export interface EnhanceResponse {
  original: string;
  enhanced: string;
}

export interface EnhanceError {
  error: "INVALID_DESCRIPTION" | "SERVICE_UNAVAILABLE";
  message: string;
}
