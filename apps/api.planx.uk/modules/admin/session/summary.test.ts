import supertest from "supertest";
import app from "../../../server.js";
import { queryMock } from "../../../tests/graphqlQueryMock.js";
import { authHeader } from "../../../tests/mockJWT.js";

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

  afterEach(() => {
    vi.clearAllMocks();
  });

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

  it.todo("returns an error if the service fails");

  it.todo("returns an error if the session can't be found");

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
