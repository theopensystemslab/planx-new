import type { 
  RequiredCreateScheduledEventArgs,
  GetScheduledEventsArgs,
  DeleteScheduledEventArgs 
} from "./types.js";
import { 
  createScheduledEvent,
  getScheduledEvents,
  deleteScheduledEvent 
} from "./index.js";
import axios from "axios";
import type { Mocked } from "vitest";

describe("POST to Hasura Metadata API", () => {
  let mockAxios: Mocked<typeof axios>;

  beforeEach(() => {
    vi.mock("axios", async (importOriginal) => {
    const actualAxios = await importOriginal<typeof axios>();
    return {
      default: {
        ...actualAxios,
        post: vi.fn(),
      },
    }});
    mockAxios = axios as Mocked<typeof axios>;
  });

  describe("Creation of scheduled event", () => {
    const mockScheduledEvent: RequiredCreateScheduledEventArgs = {
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
      const mockResponseData = {
        message: "success",
        eventId: "test-event-id"
      };
      mockAxios.post.mockResolvedValue({ data: mockResponseData });
      await expect(createScheduledEvent(mockScheduledEvent)).resolves.toBe(
        mockResponseData,
      );
    });
  });

  describe("Getting scheduled events", () => {
    const mockGetScheduledEventsArgs: GetScheduledEventsArgs = {
      type: "one_off",
      limit: 10,
      offset: 0,
      status: ["scheduled"],
    };

    test("returns an error if request fails", async () => {
      mockAxios.post.mockRejectedValue(new Error());
      await expect(getScheduledEvents(mockGetScheduledEventsArgs)).rejects.toThrow();
    });

    test("returns an error if axios errors", async () => {
      mockAxios.post.mockRejectedValue(new axios.AxiosError());
      await expect(getScheduledEvents(mockGetScheduledEventsArgs)).rejects.toThrow();
    });

    test("returns response data on success", async () => {
      const mockResponseData = {
        count: 1,
        events: [
          {
            id: "test-event-id",
            comment: "delete_123",
            created_at: "2025-09-01T12:00:00Z",
            scheduled_time: "2025-09-28T12:00:00Z",
            payload: {
              sessionId: "123",
            },
            status: "scheduled",
          },
        ],
      };
      mockAxios.post.mockResolvedValue({ data: mockResponseData });
      await expect(getScheduledEvents(mockGetScheduledEventsArgs)).resolves.toBe(
        mockResponseData,
      );
    });
  });

  describe("Deleting scheduled event", () => {

    const mockDeleteScheduledEventArgs: DeleteScheduledEventArgs = {
      type: "one_off",
      event_id: "test-event-id",
    };

    test("returns an error if request fails", async () => {
      mockAxios.post.mockRejectedValue(new Error());
      await expect(deleteScheduledEvent(mockDeleteScheduledEventArgs)).rejects.toThrow();
    });

    test("returns an error if axios errors", async () => {
      mockAxios.post.mockRejectedValue(new axios.AxiosError());
      await expect(deleteScheduledEvent(mockDeleteScheduledEventArgs)).rejects.toThrow();
    });

    test("returns response data on success", async () => {
      const mockResponseData = { message: "success" };
      mockAxios.post.mockResolvedValue({ data: mockResponseData });
      await expect(deleteScheduledEvent(mockDeleteScheduledEventArgs)).resolves.toBe(
        mockResponseData,
      );
    });
  });
});
