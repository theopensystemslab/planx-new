import { describe, expect, it } from "vitest";

import { queryMock } from "../../tests/graphqlQueryMock.js";
import { logAiGatewayExchange, logAiGuardrailRejection } from "./logs.js";
import { GATEWAY_STATUS, GUARDRAIL_REJECTION_REASON } from "./types.js";

const mockCommonArgs = {
  endpoint: "/ai/project-description/enhance",
  modelId: "google/gemini-2.5-pro",
  prompt: "Building a small rear extension",
  flowId: "123e4567-e89b-12d3-a456-426614174000",
};

describe("logAiGatewayExchange", () => {
  it("successfully logs an AI gateway exchange with all fields", async () => {
    const mockAuditLogId = "42";
    queryMock.mockQuery({
      name: "InsertAiAuditLog",
      matchOnVariables: false,
      data: {
        insertAiAuditLog: { id: mockAuditLogId },
      },
    });

    const result = await logAiGatewayExchange({
      ...mockCommonArgs,
      response: "Construction of a single-storey rear extension",
      gatewayStatus: GATEWAY_STATUS.ENHANCED,
      tokenUsage: 150,
      costUsd: 0.001,
      vercelGenerationId: "gen-01ARZ3NDEKTSV4RRFFQ69G5FAV",
      responseTimeMs: 1200,
      sessionId: "123e4567-e89b-12d3-a456-426614174001",
    });
    expect(result).toBe(42);
  });

  it("successfully logs an AI gateway exchange with only required fields", async () => {
    const mockAuditLogId = "43";
    queryMock.mockQuery({
      name: "InsertAiAuditLog",
      matchOnVariables: false,
      data: {
        insertAiAuditLog: { id: mockAuditLogId },
      },
    });

    const result = await logAiGatewayExchange(mockCommonArgs);
    expect(result).toBe(43);
  });

  it("returns null when GraphQL request fails", async () => {
    const mockError = new Error("GraphQL error");
    queryMock.mockQuery({
      name: "InsertAiAuditLog",
      data: {},
      error: mockError,
    });

    const result = await logAiGatewayExchange(mockCommonArgs);
    expect(result).toBeNull();
  });
});

describe("logAiGuardrailRejection", () => {
  it("successfully logs a guardrail rejection with all fields", async () => {
    const mockAuditLogId = "44";
    queryMock.mockQuery({
      name: "InsertAiAuditLog",
      matchOnVariables: false,
      data: {
        insertAiAuditLog: { id: mockAuditLogId },
      },
    });

    const result = await logAiGuardrailRejection({
      ...mockCommonArgs,
      guardrailReason: GUARDRAIL_REJECTION_REASON.PROMPT_INJECTION,
      guardrailMessage: "Suspicious input detected",
      sessionId: "123e4567-e89b-12d3-a456-426614174001",
    });
    expect(result).toBe(44);
  });

  it("successfully logs a guardrail rejection with only required fields", async () => {
    const mockAuditLogId = "45";
    queryMock.mockQuery({
      name: "InsertAiAuditLog",
      matchOnVariables: false,
      data: {
        insertAiAuditLog: { id: mockAuditLogId },
      },
    });

    const result = await logAiGuardrailRejection(mockCommonArgs);
    expect(result).toBe(45);
  });

  it("returns null when GraphQL request fails", async () => {
    const mockError = new Error("Database connection failed");
    queryMock.mockQuery({
      name: "InsertAiAuditLog",
      data: {},
      error: mockError,
    });

    const result = await logAiGuardrailRejection(mockCommonArgs);

    expect(result).toBeNull();
  });
});
