import { createScheduledEvent, RequiredScheduledEventArgs } from ".";
import Axios from "axios";

jest.mock("axios");
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

test("createScheduledEvent returns response data on success", async () => {
  mockAxios.post.mockResolvedValue({ data: "test data" });
  await expect(createScheduledEvent(mockScheduledEvent)).resolves.toBe(
    "test data"
  );
});
