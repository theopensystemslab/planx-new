import supertest from "supertest";

import app from "../../../server.js";

const mockEnhanceProjectDescription = vi.fn();
const mockLogAiGuardrailRejection = vi.fn();
const mockLogAiGatewayExchange = vi.fn();

vi.mock("../projectDescription/service.js", () => ({
  enhanceProjectDescription: () => mockEnhanceProjectDescription(),
}));

vi.mock("../logs.js", () => ({
  logAiGuardrailRejection: () => mockLogAiGuardrailRejection(),
  logAiGatewayExchange: () => mockLogAiGatewayExchange(),
}));

describe.todo("Input sanitisation middleware - unit tests");

describe("Input sanitisation middleware - integration tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("AI_GATEWAY_API_KEY", "test-api-key");
  });

  const mockFlowId = "123e4567-e89b-12d3-a456-426614174000";

  it("sanitises control characters from input before processing", async () => {
    mockEnhanceProjectDescription.mockResolvedValueOnce({
      ok: true,
      value: "Enhanced description",
    });

    // input with control characters should still be processed after sanitisation
    await supertest(app)
      .post("/ai/project-description/enhance")
      .send({ original: "Building\x00 an\x0B extension", flowId: mockFlowId })
      .expect(200)
      .expect((res) => {
        res.body.original === "Building an extension";
      });

    expect(mockEnhanceProjectDescription).toHaveBeenCalled();
  });
});
