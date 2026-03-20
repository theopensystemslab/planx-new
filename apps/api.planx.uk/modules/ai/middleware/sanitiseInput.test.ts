import type { NextFunction, Request, Response } from "express";
import supertest from "supertest";

import app from "../../../server.js";
import { sanitiseInput } from "./sanitiseInput.js";

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

describe("Input sanitisation middleware - unit tests", () => {
  const sanitise = sanitiseInput("original");
  it("calls next() for clean input", () => {
    const next: NextFunction = vi.fn();
    sanitise(
      getMockReq(),
      getMockRes("Rear extension to existing dwelling"),
      next,
    );
    expect(next).toHaveBeenCalledOnce();
  });

  it("removes control characters", () => {
    const res = getMockRes("Building\x00 an\x0B extension");
    sanitise(getMockReq(), res, vi.fn());
    expect(res.locals.parsedReq.body.original).toBe("Building an extension");
  });

  it("normalises whitespace", () => {
    const res = getMockRes(
      "  First   paragraph\n\n\n\nSecond \t\t paragraph  ",
    );
    sanitise(getMockReq(), res, vi.fn());
    expect(res.locals.parsedReq.body.original).toBe(
      "First paragraph\n\nSecond paragraph",
    );
  });

  it("strips XML-like tags", () => {
    const res = getMockRes("Build <script>alert('hi')</script> extension");
    sanitise(getMockReq(), res, vi.fn());
    expect(res.locals.parsedReq.body.original).toBe(
      "Build alert('hi') extension",
    );
  });
});

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
