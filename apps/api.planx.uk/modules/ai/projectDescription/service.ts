import {
  createGateway,
  generateObject,
  InvalidPromptError,
  NoContentGeneratedError,
  NoObjectGeneratedError,
  NoSuchModelError,
} from "ai";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { z } from "zod";

import {
  type GatewayResult,
  GatewayStatus,
  SUCCESS_STATUSES,
} from "./types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DEFAULT_MODEL = "google/gemini-2.5-pro";

const loadSystemPrompt = (): string => {
  const promptPath = join(__dirname, "system.md");
  let prompt = readFileSync(promptPath, "utf-8");

  // replace status placeholders with actual values
  prompt = prompt.replace(/`INVALID`/g, GatewayStatus.INVALID);
  prompt = prompt.replace(/`NO_CHANGE`/g, GatewayStatus.NO_CHANGE);
  prompt = prompt.replace(/`ENHANCED`/g, GatewayStatus.ENHANCED);

  return prompt;
};

export const enhanceProjectDescription = async (
  original_description: string,
  modelName: string = DEFAULT_MODEL,
): Promise<GatewayResult> => {
  try {
    const result = getModel(modelName);
    if (!result.ok) {
      return { ok: false, error: result.error };
    }
    if (!result.model) {
      return { ok: false, error: GatewayStatus.ERROR };
    }
    const model = result.model;

    const res = await generateObject({
      model: model,
      output: "object",
      schema: z.object({
        enhancedDescription: z.string().trim().max(250),
        status: z.enum([...SUCCESS_STATUSES, GatewayStatus.INVALID]),
      }),
      system: loadSystemPrompt(),
      prompt: `<user_input>${original_description}</user_input>`,
    });

    // TODO: log audit trail of input/output and other important metadata to db (e.g. usage.totalTokens)
    console.debug("Full response from gateway:", res);

    const object = res.object;
    console.debug(`Model returned status: ${object.status}`);
    return object.status === GatewayStatus.INVALID
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
    return { ok: false, error: GatewayStatus.ERROR };
  }
};

export const getModel = (model: string): GatewayResult => {
  try {
    const gateway = createGateway({
      apiKey: process.env.AI_GATEWAY_API_KEY!,
    });
    return { ok: true, model: gateway(model) };
  } catch (error) {
    if (NoSuchModelError.isInstance(error)) {
      console.error(
        `Model '${model}' not available in gateway. Please check the model name.`,
        error,
      );
    } else {
      console.error(`Failed to instantiate model '${model}'`, error);
    }
    return { ok: false, error: GatewayStatus.ERROR };
  }
};
