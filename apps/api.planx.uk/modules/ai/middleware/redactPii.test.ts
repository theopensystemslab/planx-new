import type { NextFunction, Request, Response } from "express";
import supertest from "supertest";

import app from "../../../server.js";
import { redactPii } from "./redactPii.js";

const mockEnhanceProjectDescription = vi.fn();
vi.mock("../projectDescription/service.js", () => ({
  enhanceProjectDescription: () => mockEnhanceProjectDescription(),
}));

const getMockRes = (input: string) => {
  return {
    locals: {
      parsedReq: {
        body: { original: input },
      },
    },
  } as unknown as Response;
};
const getMockReq = () => ({}) as unknown as Request;

describe("PII redaction middleware - unit tests", () => {
  const redact = redactPii("original");

  it("calls next() without modifying clean input", () => {
    const next: NextFunction = vi.fn();
    const res = getMockRes("Rear extension to existing dwelling");
    redact(getMockReq(), res, next);
    expect(next).toHaveBeenCalledOnce();
    expect(res.locals.parsedReq.body.original).toBe(
      "Rear extension to existing dwelling",
    );
    expect(res.locals.redactedInput).toBeUndefined();
  });

  it("redacts email addresses", () => {
    const res = getMockRes("Contact me at test@example.com about extension");
    redact(getMockReq(), res, vi.fn());
    expect(res.locals.parsedReq.body.original).toBe(
      "Contact me at [EMAIL] about extension",
    );
  });

  it("redacts postcodes", () => {
    const res = getMockRes("Property at SW1A 1AA needs extension");
    redact(getMockReq(), res, vi.fn());
    expect(res.locals.parsedReq.body.original).toBe(
      "Property at [POSTCODE] needs extension",
    );
  });

  it("redacts National Insurance numbers", () => {
    const res = getMockRes("My NI is AB 12 34 56 C for the extension");
    redact(getMockReq(), res, vi.fn());
    expect(res.locals.parsedReq.body.original).toBe(
      "My NI is [NINO] for the extension",
    );
  });

  it("redacts street addresses", () => {
    const res = getMockRes("Extension at 123 High Street for my family");
    redact(getMockReq(), res, vi.fn());
    expect(res.locals.parsedReq.body.original).toBe(
      "Extension at [ADDRESS] for my family",
    );
  });

  it("stores original input when PII is detected", () => {
    const res = getMockRes("Contact test@example.com about extension");
    redact(getMockReq(), res, vi.fn());
    expect(res.locals.originalInput).toBe(
      "Contact test@example.com about extension",
    );
    expect(res.locals.redactedInput).toBe("Contact [EMAIL] about extension");
  });
});

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
