import type * as AxiosModule from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import axios, { AxiosError } from "axios";
import type { Mocked } from "vitest";

import { runSQL } from "./index.js";

vi.mock("axios", async (importOriginal) => {
  const actualAxios = await importOriginal<typeof AxiosModule>();
  return {
    ...actualAxios,
    default: {
      ...actualAxios.default,
      post: vi.fn(),
    },
  };
});

describe("runSQL", () => {
  const mockAxios = axios as Mocked<typeof axios>;

  const sql = "SELECT * FROM TEST";

  test("returns an error if request fails", async () => {
    mockAxios.post.mockRejectedValue(new Error());
    await expect(runSQL(sql)).rejects.toThrow();
  });

  test("returns an error if Axios errors", async () => {
    mockAxios.post.mockRejectedValue(new axios.AxiosError());
    await expect(runSQL(sql)).rejects.toThrow();
  });

  test("does not leak request config (e.g. the admin secret) when Axios errors", async () => {
    const error = new AxiosError(
      "Request failed with status code 502",
      AxiosError.ERR_BAD_RESPONSE,
      {
        headers: { "x-hasura-admin-secret": "super-secret-value" },
      } as unknown as InternalAxiosRequestConfig,
    );
    mockAxios.post.mockRejectedValue(error);

    const thrown = await runSQL(sql).then(
      () => {
        throw new Error("Expected runSQL to reject");
      },
      (error: Error) => error,
    );

    expect(thrown.message).toContain("Failed to POST to Hasura Schema API");
    expect(thrown.message).toContain("Request failed with status code 502");
    expect(thrown.message).not.toContain("super-secret-value");
  });

  test("includes the error message returned by Hasura", async () => {
    const error = new AxiosError(
      "Request failed with status code 400",
      AxiosError.ERR_BAD_REQUEST,
      undefined,
      null,
      {
        status: 400,
        data: { code: "postgres-error", error: "syntax error at or near" },
      } as AxiosError["response"],
    );
    mockAxios.post.mockRejectedValue(error);

    await expect(runSQL(sql)).rejects.toThrow(
      "Failed to POST to Hasura Schema API: Request failed with status code 400 - syntax error at or near",
    );
  });

  test("returns response data on success", async () => {
    mockAxios.post.mockResolvedValue({ data: "test data" });
    await expect(runSQL(sql)).resolves.toBe("test data");
  });
});
