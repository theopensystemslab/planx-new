import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import {
  generateObject,
  InvalidPromptError,
  NoContentGeneratedError,
  NoObjectGeneratedError,
} from "ai";
import { z } from "zod";

import { logAiGatewayExchange } from "../logs.js";
import { getModel } from "../utils.js";
import {
  type GatewayResult,
  GATEWAY_STATUS,
  GATEWAY_SUCCESS_STATUSES,
} from "../types.js";

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
  modelId: string,
  sessionId?: string,
  flowId?: string,
): Promise<GatewayResult> => {
  try {
    const startTime = Date.now();
    const result = getModel(modelId);
    if (!result.ok) {
      return { ok: false, error: result.error };
    }
    if (!result.model) {
      return { ok: false, error: GATEWAY_STATUS.ERROR };
    }

    const prompt = `<user_input>${original_description}</user_input>`;
    const res = await generateObject({
      model: result.model,
      output: "object",
      schema: z.object({
        enhancedDescription: z.string().trim().max(250),
        status: z.enum([...GATEWAY_SUCCESS_STATUSES, GATEWAY_STATUS.INVALID]),
      }),
      system: loadSystemPrompt(),
      prompt,
    });

    const responseTimeMs = Date.now() - startTime;
    console.debug("Full response from gateway:", res);

    // log the exchange w/ Vercel AI Gateway to the audit table in db
    // TODO: also pass in flowId and sessionId where possible
    await logAiGatewayExchange({
      endpoint,
      modelId: res.response?.modelId || modelId,
      prompt,
      response: res.object.enhancedDescription ?? undefined,
      gatewayStatus: res.object.status || undefined,
      tokenUsage: res.usage?.totalTokens,
      costUsd: res.providerMetadata?.gateway?.cost
        ? parseFloat(res.providerMetadata.gateway.cost as string)
        : undefined,
      vercelGenerationId:
        (res.providerMetadata?.gateway?.generationId as string) || undefined,
      responseTimeMs,
      sessionId,
      flowId,
    });

    const object = res.object;
    console.debug(`Model returned status: ${object.status}`);
    return object.status === GATEWAY_STATUS.INVALID
      ? { ok: false, error: object.status }
      : { ok: true, value: object.enhancedDescription };
  } catch (error) {
    if (InvalidPromptError.isInstance(error)) {
      console.error(
        "Prompt provided to model was determined to be invalid",
        error,
      );
    } else if (NoContentGeneratedError.isInstance(error)) {
      console.error("Model failed to generate any content", error);
    } else if (NoObjectGeneratedError.isInstance(error)) {
      console.error(
        "Model failed to return an object compliant with given schema",
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
