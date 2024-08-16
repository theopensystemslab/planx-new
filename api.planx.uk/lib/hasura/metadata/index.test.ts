import type { RequiredScheduledEventArgs } from "./index.js";
import { createScheduledEvent } from "./index.js";
import axios from "axios";
import type { Mocked } from "vitest";

describe("Creation of scheduled event", () => {
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

  const mockScheduledEvent: RequiredScheduledEventArgs = {
    webhook: "test url",
    schedule_at: new Date(),
    comment: "test comment",
    payload: {},
  };

  test("returns an error if request fails", async () => {
    mockAxios.post.mockRejectedValue(new Error());
    await expect(createScheduledEvent(mockScheduledEvent)).rejects.toThrow();
  });

  test("returns an error if axios errors", async () => {
    mockAxios.post.mockRejectedValue(new axios.AxiosError());
    await expect(createScheduledEvent(mockScheduledEvent)).rejects.toThrow();
  });

  test("returns response data on success", async () => {
    mockAxios.post.mockResolvedValue({ data: "test data" });
    await expect(createScheduledEvent(mockScheduledEvent)).resolves.toBe(
      "test data",
    );
  });
});
