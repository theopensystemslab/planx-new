import supertest from "supertest";
import app from "../../../server.js";
import type * as planxCore from "@opensystemslab/planx-core";
import { authHeader } from "../../../tests/mockJWT.js";

const endpoint = (strings: TemplateStringsArray) =>
  `/admin/session/${strings[0]}/html`;

const mockGenerateHTMLData = vi.fn().mockResolvedValue({
  responses: [
    {
      question: "Is this a test?",
      responses: [{ value: "Yes" }],
      metadata: {},
    },
  ],
});

vi.mock("@opensystemslab/planx-core", async (importOriginal) => {
  const { CoreDomainClient: OriginalCoreDomainClient } =
    await importOriginal<typeof planxCore>();

  return {
    CoreDomainClient: class extends OriginalCoreDomainClient {
      constructor() {
        super();
        this.export.csvData = () => mockGenerateHTMLData();
      }
    },
  };
});

describe("HTML data admin endpoint", () => {
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

  it("requires a user to have the 'platformAdmin' role", () => {
    return supertest(app)
      .get(endpoint`123`)
      .set(authHeader({ role: "teamViewer" }))
      .expect(403);
  });

  it.skip("returns a HTML-formatted payload", () => {
    return supertest(app)
      .get(endpoint`123`)
      .set(authHeader({ role: "platformAdmin" }))
      .expect(200)
      .expect("content-type", "text/html; charset=utf-8")
      .then((res) =>
        expect(res.text).toContain("<dt>Is this a test?</dt><dd>Yes</dd>"),
      );
  });
});
