import { createGateway, NoSuchModelError } from "ai";

import { GATEWAY_STATUS, type GatewayResult } from "./types.js";

export const getModel = (modelId: string): GatewayResult => {
  try {
    const gateway = createGateway({
      apiKey: process.env.AI_GATEWAY_API_KEY,
    });
    return { ok: true, model: gateway(modelId) };
  } catch (error) {
    if (NoSuchModelError.isInstance(error)) {
      console.error(
        `Model '${modelId}' not available in Vercel AI Gateway. Please check the model ID.`,
        error,
      );
    } else {
      console.error(`Failed to instantiate model '${modelId}'`, error);
    }
    return { ok: false, error: GATEWAY_STATUS.ERROR };
  }
};
