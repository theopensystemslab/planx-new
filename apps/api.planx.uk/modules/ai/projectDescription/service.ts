import {
  APICallError,
  generateText,
  InvalidPromptError,
  NoContentGeneratedError,
  NoObjectGeneratedError,
  NoOutputGeneratedError,
  Output,
} from "ai";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import { DEFAULT_MODEL_ID } from "../constants.js";
import { logAiGatewayExchange } from "../logs.js";
import { GATEWAY_STATUS, type GatewayResult } from "../types.js";
import { getModel } from "../utils.js";
import { projectDescriptionOutputSchema } from "./types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const loadSystemPrompt = (): string => {
  const promptPath = join(__dirname, "system.md");
  let prompt = readFileSync(promptPath, "utf-8");

  // replace status placeholders with actual values
  prompt = prompt.replace(/`INVALID`/g, GATEWAY_STATUS.INVALID);
  prompt = prompt.replace(/`NO_CHANGE`/g, GATEWAY_STATUS.NO_CHANGE);
  prompt = prompt.replace(/`ENHANCED`/g, GATEWAY_STATUS.ENHANCED);

  return prompt;
};

export const enhanceProjectDescription = async (
  original_description: string,
  endpoint: string,
  flowId: string,
  sessionId?: string,
): Promise<GatewayResult> => {
  try {
    const startTime = Date.now();
    const model = getModel(DEFAULT_MODEL_ID);
    const prompt = `<user_input>${original_description}</user_input>`;
    const res = await generateText({
      model,
      output: Output.object({
        schema: projectDescriptionOutputSchema,
      }),
      instructions: loadSystemPrompt(),
      prompt,
      // XXX: we enforce only routing to providers which don't train on prompt data
      // we want to upgrade to ZDR + in-EU inference in future (depending on model availability)
      providerOptions: {
        gateway: {
          disallowPromptTraining: true,
        },
      },
    });
    const responseTimeMs = Date.now() - startTime;

    // log the exchange w/ Vercel AI Gateway to the audit table in db
    await logAiGatewayExchange({
      endpoint,
      modelId: res.finalStep.response.modelId || DEFAULT_MODEL_ID,
      prompt,
      response: res.output.enhancedDescription ?? undefined,
      gatewayStatus: res.output.status || undefined,
      tokenUsage: res.usage?.totalTokens,
      costUsd: res.finalStep.providerMetadata?.gateway?.cost
        ? parseFloat(res.finalStep.providerMetadata.gateway.cost as string)
        : undefined,
      vercelGenerationId:
        (res.finalStep.providerMetadata?.gateway?.generationId as string) ||
        undefined,
      responseTimeMs,
      flowId,
      sessionId,
    });

    const output = res.output;
    console.debug(`Model returned status: ${output.status}`);
    return output.status === GATEWAY_STATUS.INVALID
      ? { ok: false, error: output.status }
      : { ok: true, value: output.enhancedDescription };
  } catch (error) {
    // full list of AI SDK errors: https://ai-sdk.dev/docs/reference/ai-sdk-errors
    if (InvalidPromptError.isInstance(error)) {
      console.error(
        "Prompt provided to model was determined to be invalid",
        error,
      );
      return { ok: false, error: GATEWAY_STATUS.INVALID };
    } else if (NoContentGeneratedError.isInstance(error)) {
      console.error("Model failed to generate any content", error);
    } else if (NoObjectGeneratedError.isInstance(error)) {
      console.error(
        "Model failed to return an output compliant with given schema",
        error,
      );
    } else if (NoOutputGeneratedError.isInstance(error)) {
      console.error("Model failed to return any output whatsoever", error);
    } else if (isUnroutableRequestError(error)) {
      console.error(
        `No AI Gateway provider for '${DEFAULT_MODEL_ID}' meets the requirements in request (and/or in account-wide settings) - ${
          getGatewayRejectionName(error) ?? "reason unknown"
        }`,
        error,
      );
    } else {
      console.error(
        "Unexpected error with request to Vercel AI Gateway",
        error,
      );
    }
    return { ok: false, error: GATEWAY_STATUS.ERROR };
  }
};

/**
 * The Gateway rejects a request with 400 invalid_request_error when no provider can
 * satisfy the requested constraints, e.g. inference region, ZDR, etc. It names the
 * specific reason in `error.param.name`, e.g. NoInferenceEndpointProvidersError.
 */
const isUnroutableRequestError = (error: unknown): boolean =>
  error instanceof Error &&
  "type" in error &&
  error.type === "invalid_request_error" &&
  "statusCode" in error &&
  error.statusCode === 400;

/**
 * The Gateway*Error classes from `@ai-sdk/gateway` aren't re-exported from `ai` package,
 * so we catch this error by duck-type, as above. Its `cause` is an APICallError,
 * which *is* exported and carries the parsed response body on `data`.
 */
const getGatewayRejectionName = (error: unknown): string | undefined => {
  const cause = error instanceof Error ? error.cause : undefined;
  if (!APICallError.isInstance(cause)) return undefined;

  const body = cause.data as
    { error?: { param?: { name?: unknown } } } | undefined;
  const name = body?.error?.param?.name;

  return typeof name === "string" ? name : undefined;
};
