import supertest from "supertest";
import app from "../../server";
import { queryMock } from "../../tests/graphqlQueryMock";
import { authHeader } from "../../tests/mockJWT";

const endpoint = (strings: TemplateStringsArray) =>
  `/admin/session/${strings[0]}/summary`;

describe("Session summary admin endpoint", () => {
  beforeEach(() => {
    queryMock.mockQuery({
      name: "GetSessionSummary",
      variables: {
        sessionId: "abc123",
      },
      data: {
        lowcalSession: {},
      },
    });
  });

  afterEach(() => jest.clearAllMocks());

  it("requires a user to be logged in", async () => {
    await supertest(app)
      .get(endpoint`abc123`)
      .expect(401)
      .then((res) =>
        expect(res.body).toEqual({
          error: "No authorization token was found",
        }),
      );
  });

  it("requires a user to have the 'platformAdmin' role", async () => {
    await supertest(app)
      .get(endpoint`abc123`)
      .set(authHeader({ role: "teamEditor" }))
      .expect(403);
  });

  it("returns JSON", async () => {
    await supertest(app)
      .get(endpoint`abc123`)
      .set(authHeader({ role: "platformAdmin" }))
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("{}");
      });
  });
});
