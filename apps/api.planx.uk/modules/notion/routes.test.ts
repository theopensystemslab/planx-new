import supertest from "supertest";

import app from "../../server.js";
import { authHeader } from "../../tests/mockJWT.js";

const PAGE_ID = "3d6a3c448ac280baa77bd6dc264906b8";
const ENDPOINT = `/notion/page/${PAGE_ID}`;

const { mockGetPage } = vi.hoisted(() => ({ mockGetPage: vi.fn() }));
vi.mock("notion-client", () => ({
  NotionAPI: class {
    getPage = mockGetPage;
  },
}));

afterEach(() => {
  vi.clearAllMocks();
});

it("requires a user to be logged in", async () => {
  await supertest(app).get(ENDPOINT).expect(401);
});

it("rejects an invalid page ID", async () => {
  await supertest(app)
    .get("/notion/page/not-a-page-id")
    .set(authHeader({ role: "teamEditor" }))
    .expect(400);

  expect(mockGetPage).not.toHaveBeenCalled();
});

it("returns the record map for a page", async () => {
  const recordMap = { block: { [PAGE_ID]: {} } };
  mockGetPage.mockResolvedValue(recordMap);

  await supertest(app)
    .get(ENDPOINT)
    .set(authHeader({ role: "teamEditor" }))
    .expect(200)
    .then((res) => {
      expect(res.body).toEqual(recordMap);
    });

  expect(mockGetPage).toHaveBeenCalledWith(PAGE_ID);
});

it("accepts hyphenated page IDs", async () => {
  mockGetPage.mockResolvedValue({});

  await supertest(app)
    .get("/notion/page/3d6a3c44-8ac2-80ba-a77b-d6dc264906b8")
    .set(authHeader({ role: "teamEditor" }))
    .expect(200);

  expect(mockGetPage).toHaveBeenCalledWith(PAGE_ID);
});

it("returns an error if Notion fails", async () => {
  mockGetPage.mockRejectedValue(new Error("Notion is down"));

  await supertest(app)
    .get(ENDPOINT)
    .set(authHeader({ role: "teamEditor" }))
    .expect(500)
    .then((res) => {
      expect(res.body.error).toMatch(/Failed to fetch Notion page/);
    });
});
