import type { LanguageModel } from "ai";
import { z } from "zod";

import type { ValidatedRequestHandler } from "../../../shared/middleware/validate.js";

export const schema = z.object({
  body: z.object({
    original: z.string().trim().max(250),
  }),
});

interface Success {
  original: string;
  enhanced: string;
}

interface Failure {
  error: ErrorStatus;
  message: string;
}

export type Controller = ValidatedRequestHandler<
  typeof schema,
  Success | Failure
>;

// we use a plain object w/ const assertion in place of problematic TS enum (as per Total Typescript)
export const GATEWAY_STATUS = {
  ENHANCED: "ENHANCED",
  NO_CHANGE: "NO_CHANGE",
  INVALID: "INVALID",
  ERROR: "ERROR",
} as const;

export type GatewayStatus = keyof typeof GATEWAY_STATUS;

export const SUCCESS_STATUSES = [
  GATEWAY_STATUS.ENHANCED,
  GATEWAY_STATUS.NO_CHANGE,
] as const;

export const ERROR_STATUSES = [
  GATEWAY_STATUS.INVALID,
  GATEWAY_STATUS.ERROR,
] as const;

export type SuccessStatus = (typeof SUCCESS_STATUSES)[number];
export type ErrorStatus = (typeof ERROR_STATUSES)[number];

type GatewaySuccess = {
  ok: true;
  value?: string;
  model?: LanguageModel;
};

type GatewayFailure = {
  ok: false;
  error: ErrorStatus;
};

export type GatewayResult = GatewaySuccess | GatewayFailure;
