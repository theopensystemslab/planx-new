import { Feedback, parseFeedback } from "./downloadFeedbackCSV";
import supertest from "supertest";
import app from "../../server";
import { authHeader } from "../../tests/mockJWT";
import Axios from "axios";

jest.mock("axios");
const mockAxios = Axios as jest.Mocked<typeof Axios>;

const ENDPOINT = "/admin/feedback";

const mockFeedback: Feedback = {
  id: 123,
  text: "Service feedback",
  category: "idea",
  createdAt: "timestamp",
  location: "http://editor.planx.test/team/service",
  screenshotUrl: "",
  device: {
    client: {
      name: "Chrome",
      version: "123",
    },
    os: {
      name: "Linux",
      version: "123",
    },
  },
  metadata: [
    {
      key: "project-type",
      value: "extension",
    },
    {
      key: "uprn",
      value: "12345",
    },
    {
      key: "team",
      value: "test team",
    },
    {
      key: "service",
      value: "test service",
    },
  ],
};

describe("Download feedback CSV endpoint", () => {
  afterEach(() => jest.clearAllMocks());

  it("requires a user to be logged in", async () => {
    await supertest(app)
      .get(ENDPOINT)
      .expect(401)
      .then((res) =>
        expect(res.body).toEqual({
          error: "No authorization token was found",
        })
      );
  });

  it("requires the 'cookie' query parameter", async () => {
    await supertest(app)
      .get(ENDPOINT)
      .set(authHeader())
      .expect(401)
      .then((res) => expect(res.body).toEqual({ error: "Missing cookie" }));
  });

  it("returns an error if request to FeedbackFish fails", async () => {
    mockAxios.post.mockRejectedValue(new Error("FeedbackFish query failed!"));
    await supertest(app)
      .get(ENDPOINT)
      .set(authHeader())
      .query({ cookie: "test cookie" })
      .expect(500)
      .then((res) =>
        expect(res.body.error).toMatch(/FeedbackFish query failed!/)
      );
  });

  it("passes the provided cookie to FeedbackFish", async () => {
    mockAxios.post.mockResolvedValue({
      data: { data: { feedback: [mockFeedback] } },
    });
    const cookie = "test cookie";
    await supertest(app)
      .get(ENDPOINT)
      .set(authHeader())
      .query({ cookie })
      .expect(200)
      .then(() => {
        expect(mockAxios.post).toHaveBeenCalledWith(
          expect.stringContaining("https"),
          expect.objectContaining({ query: expect.stringContaining("query") }),
          { headers: { cookie } }
        );
      });
  });

  it("returns a CSV file", async () => {
    mockAxios.post.mockResolvedValue({
      data: { data: { feedback: [mockFeedback] } },
    });
    const cookie = "test cookie";
    await supertest(app)
      .get(ENDPOINT)
      .set(authHeader())
      .query({ cookie })
      .expect(200)
      .expect("content-type", "text/csv; charset=utf-8");
  });
});

describe("parseFeedback helper function", () => {
  it("correctly parses FeedbackFish data", () => {
    const { metadata, ...restMockFeedback } = mockFeedback;
    const result = parseFeedback([mockFeedback]);

    // Metadata is parsed from query result
    expect(result[0]).toMatchObject({
      uprn: "12345",
      team: "test team",
      service: "test service",
      "project-type": "extension",
    });

    // Standard values from FeedbackFish are maintained
    expect(result[0]).toMatchObject({
      ...restMockFeedback,
    });

    // Raw metadata from FeedbackFish is stripped out
    expect(result[0]).not.toMatchObject({
      metadata,
    });
  });
});
