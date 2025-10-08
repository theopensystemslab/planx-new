import { runSQL } from "./index.js";
import axios from "axios";
import type { Mocked } from "vitest";

describe("runSQL", () => {
  vi.mock("axios", async (importOriginal) => {
    const actualAxios = await importOriginal<typeof axios>();
    return {
      default: {
        ...actualAxios,
        post: vi.fn(),
      },
    };
  });
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

  test("returns response data on success", async () => {
    mockAxios.post.mockResolvedValue({ data: "test data" });
    await expect(runSQL(sql)).resolves.toBe("test data");
  });
});
