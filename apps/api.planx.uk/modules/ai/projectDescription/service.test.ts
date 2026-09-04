import { APICallError } from "ai";
// see: https://ai-sdk.dev/docs/ai-sdk-core/testing
import { MockLanguageModelV4 } from "ai/test";

import { DEFAULT_MODEL_ID } from "../constants.js";
import { GATEWAY_STATUS } from "../types.js";
import { enhanceProjectDescription } from "./service.js";

const mockLogAiGatewayExchange = vi.fn();
const mockGetModel = vi.fn();

vi.mock("../logs.js", () => ({
  logAiGatewayExchange: (args: unknown) => mockLogAiGatewayExchange(args),
}));

vi.mock("../utils.js", () => ({
  getModel: () => mockGetModel(),
}));

const mockFlowId = "123e4567-e89b-12d3-a456-426614174000";
const endpoint = "/ai/project-description/enhance";

/** Captures the options `generateText` passes down to the model. */
let modelCallOptions: Record<string, unknown> | undefined;

// a model returning a schema-compliant object, plus the gateway metadata the audit log reads
const stubModel = (
  overrides: {
    enhancedDescription?: string;
    status?: string;
  } = {},
) =>
  new MockLanguageModelV4({
    doGenerate: async (options) => {
      modelCallOptions = options as unknown as Record<string, unknown>;
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              enhancedDescription:
                overrides.enhancedDescription ??
                "Construction of a single-storey rear extension to an existing dwelling",
              status: overrides.status ?? GATEWAY_STATUS.ENHANCED,
            }),
          },
        ],
        finishReason: { unified: "stop", raw: "stop" },
        usage: {
          inputTokens: {
            total: 120,
            noCache: 120,
            cacheRead: 0,
            cacheWrite: 0,
          },
          outputTokens: { total: 30, text: 30, reasoning: 0 },
        },
        providerMetadata: {
          gateway: { cost: "0.00042", generationId: "gen_abc123" },
        },
        response: { modelId: DEFAULT_MODEL_ID },
        warnings: [],
      };
    },
  });

const enhance = () =>
  enhanceProjectDescription(
    "small rear extension",
    endpoint,
    mockFlowId,
    undefined,
  );

describe("enhanceProjectDescription", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    modelCallOptions = undefined;
  });

  describe("request options sent to the gateway", () => {
    it("enforces disallowPromptTraining nested under the gateway provider key", async () => {
      // guard against providerOptions being dropped, leaving disallowPromptTraining unenforced
      mockGetModel.mockReturnValueOnce(stubModel());

      await enhance();

      expect(modelCallOptions?.providerOptions).toMatchObject({
        gateway: { disallowPromptTraining: true },
      });
    });

    it("sends the loaded system prompt as a system message", async () => {
      // v7 renamed the top-level option from `system` to `instructions`; either way it should reach
      // the model as a system message, with the status placeholders in system.md already substituted
      mockGetModel.mockReturnValueOnce(stubModel());

      await enhance();

      expect(modelCallOptions?.prompt).toMatchObject([
        {
          role: "system",
          content: expect.stringContaining(GATEWAY_STATUS.ENHANCED),
        },
        { role: "user" },
      ]);
    });
  });

  describe("successful enhancement", () => {
    it("returns the enhanced description", async () => {
      mockGetModel.mockReturnValueOnce(stubModel());

      await expect(enhance()).resolves.toEqual({
        ok: true,
        value:
          "Construction of a single-storey rear extension to an existing dwelling",
      });
    });

    it("records the exchange against the final step", async () => {
      mockGetModel.mockReturnValueOnce(stubModel());

      await enhance();

      expect(mockLogAiGatewayExchange).toHaveBeenCalledWith(
        expect.objectContaining({
          endpoint,
          flowId: mockFlowId,
          modelId: DEFAULT_MODEL_ID,
          gatewayStatus: GATEWAY_STATUS.ENHANCED,
          tokenUsage: 150,
          costUsd: 0.00042,
          vercelGenerationId: "gen_abc123",
        }),
      );
    });
  });

  describe("error handling", () => {
    it("reports a description the model judged unrelated to planning", async () => {
      mockGetModel.mockReturnValueOnce(
        stubModel({ status: GATEWAY_STATUS.INVALID }),
      );

      await expect(enhance()).resolves.toEqual({
        ok: false,
        error: GATEWAY_STATUS.INVALID,
      });
    });

    it("names the reason when no provider satisfies the request constraints", async () => {
      // the gateway rejects an unroutable request with a 400
      // `invalid_request_error`, naming the cause in `error.param.name`
      const message =
        "No provider for google/gemini-3.1-pro-preview supports the requested inference region.";
      const body = {
        error: {
          message,
          type: "invalid_request_error",
          param: { name: "NoInferenceEndpointProvidersError" },
        },
      };
      const unroutable = Object.assign(new Error(message), {
        type: "invalid_request_error",
        statusCode: 400,
        cause: new APICallError({
          message,
          url: "https://ai-gateway.vercel.sh/v4/ai/language-model",
          requestBodyValues: {},
          statusCode: 400,
          responseBody: JSON.stringify(body),
          data: body,
          isRetryable: false,
        }),
      });

      mockGetModel.mockReturnValueOnce(
        new MockLanguageModelV4({
          doGenerate: async () => {
            throw unroutable;
          },
        }),
      );

      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      await expect(enhance()).resolves.toEqual({
        ok: false,
        error: GATEWAY_STATUS.ERROR,
      });

      expect(consoleError).toHaveBeenCalledWith(
        expect.stringContaining("NoInferenceEndpointProvidersError"),
        expect.anything(),
      );

      consoleError.mockRestore();
    });
  });
});
