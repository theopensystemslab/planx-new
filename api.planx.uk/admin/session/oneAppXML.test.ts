import supertest from "supertest";
import app from "../../server";
import { queryMock } from "../../tests/graphqlQueryMock";
import { authHeader } from "../../tests/mockJWT";

const endpoint = (strings: TemplateStringsArray) =>
  `/admin/session/${strings[0]}/xml`;

describe("OneApp XML endpoint", () => {
  beforeEach(() => {
    queryMock.mockQuery({
      name: "GetMostRecentUniformApplicationBySessionID",
      variables: {
        submission_reference: "abc123",
      },
      data: {
        uniform_applications: [{ xml: "<dummy:xml></dummy:xml>" }],
      },
    });

    queryMock.mockQuery({
      name: "GetMostRecentUniformApplicationBySessionID",
      variables: {
        submission_reference: "xyz789",
      },
      data: {
        uniform_applications: [],
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

  it("returns an error if sessionID is invalid", async () => {
    await supertest(app)
      .get(endpoint`xyz789`)
      .set(authHeader())
      .expect(500)
      .then((res) => expect(res.body.error).toMatch(/Invalid sessionID/));
  });

  it("returns XML", async () => {
    await supertest(app)
      .get(endpoint`abc123`)
      .set(authHeader())
      .expect(200)
      .expect("content-type", "text/xml; charset=utf-8")
      .then((res) => {
        expect(res.text).toBe("<dummy:xml></dummy:xml>");
      });
  });
});
