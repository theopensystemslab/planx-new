import type { LanguageModel } from "ai";

// we use plain objects w/ const assertion in place of problematic TS enums
export const GATEWAY_STATUS = {
  ENHANCED: "ENHANCED",
  NO_CHANGE: "NO_CHANGE",
  INVALID: "INVALID_INPUT",
  ERROR: "GATEWAY_ERROR",
} as const;

export type GatewayStatus = keyof typeof GATEWAY_STATUS;

export const GATEWAY_SUCCESS_STATUSES = [
  GATEWAY_STATUS.ENHANCED,
  GATEWAY_STATUS.NO_CHANGE,
] as const;

export const GATEWAY_ERROR_STATUSES = [
  GATEWAY_STATUS.INVALID,
  GATEWAY_STATUS.ERROR,
] as const;

export type GatewaySuccessStatus = (typeof GATEWAY_SUCCESS_STATUSES)[number];
export type GatewayErrorStatus = (typeof GATEWAY_ERROR_STATUSES)[number];

type GatewaySuccess = {
  ok: true;
  value?: string;
  model?: LanguageModel;
};

type GatewayFailure = {
  ok: false;
  error: GatewayErrorStatus;
};

export type GatewayResult = GatewaySuccess | GatewayFailure;

export const API_ERROR_STATUS = {
  ERROR: "SERVER_ERROR",
  RATE_LIMIT: "TOO_MANY_REQUESTS",
  GUARDRAIL_TRIPPED: "GUARDRAIL_TRIPPED",
};

export type ApiErrorStatus = keyof typeof API_ERROR_STATUS;

export const GUARDRAIL_REJECTION_REASON = {
  PROMPT_INJECTION: "PROMPT_INJECTION",
};

export type GuardrailRejectionReason = keyof typeof GUARDRAIL_REJECTION_REASON;
