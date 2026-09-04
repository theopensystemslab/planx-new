import { DEFAULT_MODEL_ID } from "./constants.js";
import { getModel } from "./utils.js";

describe("getModel", () => {
  beforeEach(() => {
    vi.stubEnv("AI_GATEWAY_API_KEY", "test-api-key");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("resolves a gateway-backed model for the requested ID", () => {
    const model = getModel("google/gemini-3.7-flash");

    expect(model).toMatchObject({
      modelId: "google/gemini-3.7-flash",
      provider: "gateway",
      specificationVersion: "v4",
    });
  });

  it("resolves the default model", () => {
    expect(getModel(DEFAULT_MODEL_ID)).toMatchObject({
      modelId: DEFAULT_MODEL_ID,
      provider: "gateway",
    });
  });

  it("returns a model that can be called", () => {
    // the model is a lazy handle, not a live connection
    expect(getModel(DEFAULT_MODEL_ID)).toHaveProperty(
      "doGenerate",
      expect.any(Function),
    );
  });

  it("does not validate the model ID", () => {
    // the gateway resolves any slug, rejecting unknown models server-side when
    // the request is made - so a bad ID surfaces from `generateText`, not here
    expect(() => getModel("not-a-real/model-xyz")).not.toThrow();
    expect(getModel("not-a-real/model-xyz")).toMatchObject({
      modelId: "not-a-real/model-xyz",
    });
  });

  it("authenticates with the gateway API key from the environment", async () => {
    vi.stubEnv("AI_GATEWAY_API_KEY", "sentinel-key");

    // reaching into the provider's own config is the only way to observe this
    // wiring, since the key is otherwise used only when a request is made
    const { config } = getModel(DEFAULT_MODEL_ID) as unknown as {
      config: { headers: () => Record<string, string> };
    };

    await expect(config.headers()).resolves.toMatchObject({
      authorization: "Bearer sentinel-key",
    });
  });

  it("does not require an API key to be set", () => {
    // likewise deferred: a missing key surfaces when the request is made.
    // `projectDescriptionController` is what guards this case up front
    vi.stubEnv("AI_GATEWAY_API_KEY", undefined);

    expect(() => getModel(DEFAULT_MODEL_ID)).not.toThrow();
  });
});
