import { runSQL } from ".";
import Axios, { AxiosError } from "axios";

jest.mock("axios", () => ({
  ...jest.requireActual("axios"),
  post: jest.fn(),
}));
const mockAxios = Axios as jest.Mocked<typeof Axios>;

const sql = "SELECT * FROM TEST";

test("runSQL returns an error if request fails", async () => {
  mockAxios.post.mockRejectedValue(new Error());
  await expect(runSQL(sql)).rejects.toThrow();
});

test("runSQL returns an error if Axios errors", async () => {
  mockAxios.post.mockRejectedValue(new AxiosError());
  await expect(runSQL(sql)).rejects.toThrow();
});

test("runSQL returns response data on success", async () => {
  mockAxios.post.mockResolvedValue({ data: "test data" });
  await expect(runSQL(sql)).resolves.toBe("test data");
});
