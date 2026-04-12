import type { LanguageModel } from "ai";

// we use plain objects w/ const assertion in place of problematic TS enums
export const GATEWAY_STATUS = {
  ENHANCED: "ENHANCED",
  NO_CHANGE: "NO_CHANGE",
  INVALID: "INVALID_INPUT",
  ERROR: "GATEWAY_ERROR",
} as const;

export type GatewayStatus =
  (typeof GATEWAY_STATUS)[keyof typeof GATEWAY_STATUS];

export const GATEWAY_SUCCESS_STATUSES = [
  GATEWAY_STATUS.ENHANCED,
  GATEWAY_STATUS.NO_CHANGE,
] as const;

export const GATEWAY_FAILURE_STATUSES = [
  GATEWAY_STATUS.INVALID,
  GATEWAY_STATUS.ERROR,
] as const;

export type GatewaySuccessStatus = (typeof GATEWAY_SUCCESS_STATUSES)[number];
export type GatewayFailureStatus = (typeof GATEWAY_FAILURE_STATUSES)[number];

type GatewaySuccess = {
  ok: true;
  value?: string;
  model?: LanguageModel;
};

type GatewayFailure = {
  ok: false;
  error: GatewayFailureStatus;
};

export type GatewayResult = GatewaySuccess | GatewayFailure;

export const API_ERROR_STATUS = {
  RATE_LIMIT: "TOO_MANY_REQUESTS",
  GUARDRAIL: "GUARDRAIL_TRIPPED",
} as const;

export type ApiErrorStatus =
  (typeof API_ERROR_STATUS)[keyof typeof API_ERROR_STATUS];

export const GUARDRAIL_REJECTION_REASON = {
  PROMPT_INJECTION: "PROMPT_INJECTION",
} as const;

export type GuardrailRejectionReason =
  (typeof GUARDRAIL_REJECTION_REASON)[keyof typeof GUARDRAIL_REJECTION_REASON];
