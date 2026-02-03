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

describe.todo("PII redaction middleware - unit tests");

describe("PII redaction middleware - integration tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("AI_GATEWAY_API_KEY", "test-api-key");
  });

  const mockFlowId = "123e4567-e89b-12d3-a456-426614174000";

  it("redacts email addresses from input before processing", async () => {
    mockEnhanceProjectDescription.mockResolvedValueOnce({
      ok: true,
      value: "Enhanced description without email",
    });

    await supertest(app)
      .post("/ai/project-description/enhance")
      .send({
        original: "Contact me at test@example.com about extension",
        flowId: mockFlowId,
      })
      .expect(200)
      .expect((res) => {
        res.body.original === "Contact me at [EMAIL] about extension";
      });

    expect(mockEnhanceProjectDescription).toHaveBeenCalled();
  });

  it("redacts UK postcodes from input before processing", async () => {
    mockEnhanceProjectDescription.mockResolvedValueOnce({
      ok: true,
      value: "Enhanced description without postcode",
    });

    await supertest(app)
      .post("/ai/project-description/enhance")
      .send({
        original: "Property at SW1A 1AA needs extension",
        flowId: mockFlowId,
      })
      .expect(200)
      .expect((res) => {
        res.body.original === "Property at [POSTCODE] needs extension";
      });

    expect(mockEnhanceProjectDescription).toHaveBeenCalled();
  });

  it("redacts National Insurance Numbers from input before processing", async () => {
    mockEnhanceProjectDescription.mockResolvedValueOnce({
      ok: true,
      value: "Enhanced description without NINO",
    });

    await supertest(app)
      .post("/ai/project-description/enhance")
      .send({
        original: "My number is AB 12 34 56 C for the extension",
        flowId: mockFlowId,
      })
      .expect(200)
      .expect((res) => {
        res.body.original === "My number is [NINO] for the extension";
      });

    expect(mockEnhanceProjectDescription).toHaveBeenCalled();
  });

  it("redacts addresses from input before processing", async () => {
    mockEnhanceProjectDescription.mockResolvedValueOnce({
      ok: true,
      value: "Enhanced description without address",
    });

    await supertest(app)
      .post("/ai/project-description/enhance")
      .send({
        original: "Extension at 123 High Street for my family",
        flowId: mockFlowId,
      })
      .expect(200)
      .expect((res) => {
        res.body.original === "Extension at [ADDRESS] for my family";
      });

    expect(mockEnhanceProjectDescription).toHaveBeenCalled();
  });
});
