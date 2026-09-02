import { createGateway, type LanguageModel } from "ai";

/**
 * Resolves a model through the Vercel AI Gateway.
 *
 * Nothing is validated here - the gateway builds the model lazily, so an
 * unknown model ID or a missing API key only surfaces when the request is
 * actually made, as an error from `generateText`.
 */
export const getModel = (modelId: string): LanguageModel =>
  createGateway({ apiKey: process.env.AI_GATEWAY_API_KEY })(modelId);
