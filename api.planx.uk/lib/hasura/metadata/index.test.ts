import { createScheduledEvent, RequiredScheduledEventArgs } from ".";
import Axios, { AxiosError } from "axios";

jest.mock("axios", () => ({
  ...jest.requireActual("axios"),
  post: jest.fn(),
}));
const mockAxios = Axios as jest.Mocked<typeof Axios>;

const mockScheduledEvent: RequiredScheduledEventArgs = {
  webhook: "test url",
  schedule_at: new Date(),
  comment: "test comment",
  payload: {},
};

test("createScheduledEvent returns an error if request fails", async () => {
  mockAxios.post.mockRejectedValue(new Error());
  await expect(createScheduledEvent(mockScheduledEvent)).rejects.toThrow();
});

test("createScheduledEvent returns an error if Axios errors", async () => {
  mockAxios.post.mockRejectedValue(new AxiosError());
  await expect(createScheduledEvent(mockScheduledEvent)).rejects.toThrow();
});

test("createScheduledEvent returns response data on success", async () => {
  mockAxios.post.mockResolvedValue({ data: "test data" });
  await expect(createScheduledEvent(mockScheduledEvent)).resolves.toBe(
    "test data",
  );
});
