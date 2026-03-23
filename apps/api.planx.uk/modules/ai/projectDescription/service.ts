import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import {
  generateText,
  InvalidPromptError,
  NoContentGeneratedError,
  NoObjectGeneratedError,
  Output,
} from "ai";

import { logAiGatewayExchange } from "../logs.js";
import { getModel } from "../utils.js";
import { type GatewayResult, GATEWAY_STATUS } from "../types.js";
import { projectDescriptionOutputSchema } from "./types.js";
import { DEFAULT_MODEL_ID } from "../constants.js";

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
    const result = getModel(DEFAULT_MODEL_ID);
    if (!result.ok) {
      return { ok: false, error: result.error };
    }
    if (!result.model) {
      return { ok: false, error: GATEWAY_STATUS.ERROR };
    }
    const prompt = `<user_input>${original_description}</user_input>`;
    const res = await generateText({
      model: result.model,
      output: Output.object({
        schema: projectDescriptionOutputSchema,
      }),
      system: loadSystemPrompt(),
      prompt,
    });
    const responseTimeMs = Date.now() - startTime;

    // log the exchange w/ Vercel AI Gateway to the audit table in db
    await logAiGatewayExchange({
      endpoint,
      modelId: res.response?.modelId || DEFAULT_MODEL_ID,
      prompt,
      response: res.output.enhancedDescription ?? undefined,
      gatewayStatus: res.output.status || undefined,
      tokenUsage: res.usage?.totalTokens,
      costUsd: res.providerMetadata?.gateway?.cost
        ? parseFloat(res.providerMetadata.gateway.cost as string)
        : undefined,
      vercelGenerationId:
        (res.providerMetadata?.gateway?.generationId as string) || undefined,
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
    } else {
      console.error(
        "Unexpected error with request to Vercel AI Gateway",
        error,
      );
    }
    return { ok: false, error: GATEWAY_STATUS.ERROR };
  }
};
