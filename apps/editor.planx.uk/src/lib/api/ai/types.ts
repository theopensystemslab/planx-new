export interface EnhanceResponse {
  original: string;
  suggested: string;
}

export interface EnhanceError {
  error: "INVALID_DESCRIPTION" | "SERVICE_UNAVAILABLE";
  message: string;
}
