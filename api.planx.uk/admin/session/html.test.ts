import supertest from "supertest";
import app from "../../server";
import { authHeader } from "../../tests/mockJWT";

const endpoint = (strings: TemplateStringsArray) =>
  `/admin/session/${strings[0]}/html`;

const mockGenerateHTMLData = jest.fn().mockResolvedValue({
  responses: [
    {
      question: "Is this a test?",
      responses: [{ value: "Yes" }],
      metadata: {},
    },
  ],
  redactedResponses: [],
});
jest.mock("../../client", () => {
  return {
    $admin: {
      export: {
        csvData: () => mockGenerateHTMLData(),
      },
    },
  };
});

describe("HTML data admin endpoint", () => {
  afterEach(() => jest.clearAllMocks());

  it("requires a user to be logged in", () => {
    return supertest(app)
      .get(endpoint`123`)
      .expect(401)
      .then((res) =>
        expect(res.body).toEqual({
          error: "No authorization token was found",
        }),
      );
  });

  it("returns a HTML-formatted payload", async () => {
    const response = await supertest(app)
      .get(endpoint`123`)
      .set(authHeader());
    expect(response.status).toEqual(200);
    expect(response.header["content-type"]).toEqual("text/html; charset=utf-8");
    expect(response.text).toContain("<dt>Is this a test?</dt><dd>Yes</dd>");
  });
});
