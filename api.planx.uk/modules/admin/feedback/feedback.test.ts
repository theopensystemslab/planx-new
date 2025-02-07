import supertest from "supertest";
import app from "../../../server.js";
import { queryMock } from "../../../tests/graphqlQueryMock.js";
import { authHeader } from "../../../tests/mockJWT.js";

describe("Feedback admin endpoint", () => {
  beforeEach(() => {
    queryMock.mockQuery({
      name: "GetFeedback",
      variables: {
        feedbackId: 1,
      },
      data: {
        feedback: {},
      },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("requires a user to be logged in", async () => {
    await supertest(app)
      .get(`/admin/feedback/1`)
      .expect(401)
      .then((res) =>
        expect(res.body).toEqual({
          error: "No authorization token was found",
        }),
      );
  });

  it("requires a user to have the 'platformAdmin' role", async () => {
    await supertest(app)
      .get(`/admin/feedback/1`)
      .set(authHeader({ role: "teamEditor" }))
      .expect(403);
  });

  it("returns an error if the feedback ID can't be found", async () => {
    await supertest(app)
      .get(`/admin/feedback/999`)
      .set(authHeader({ role: "platformAdmin" }))
      .expect(500);
  });

  it("returns JSON", async () => {
    await supertest(app)
      .get(`/admin/feedback/1`)
      .set(authHeader({ role: "platformAdmin" }))
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("{}");
      });
  });
});
