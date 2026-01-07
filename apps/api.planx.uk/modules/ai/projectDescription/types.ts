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

// TODO: replace enum as per Matt Pocock (https://www.youtube.com/watch?v=jjMbPt_H3RQ)
export enum GatewayStatus {
  ENHANCED = "ENHANCED",
  NO_CHANGE = "NO_CHANGE",
  INVALID = "INVALID_DESCRIPTION",
  ERROR = "GATEWAY_ERROR",
}

export const SUCCESS_STATUSES = [
  GatewayStatus.ENHANCED,
  GatewayStatus.NO_CHANGE,
] as const;
export const ERROR_STATUSES = [
  GatewayStatus.INVALID,
  GatewayStatus.ERROR,
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
