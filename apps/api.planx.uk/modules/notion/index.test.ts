import nock from "nock";
import supertest from "supertest";

import app from "../../server.js";
import { COMPONENT_GUIDE_PAGE_ID } from "./constants.js";
import { clearComponentGuideCache } from "./service/index.js";

const NOTION_HOST = "https://api.notion.com";
const childrenPath = (id: string) => `/v1/blocks/${id}/children`;

const paragraph = (text: string) => ({
  id: `p-${text}`,
  type: "paragraph",
  has_children: false,
  paragraph: {
    rich_text: [
      {
        plain_text: text,
        href: null,
        annotations: {
          bold: false,
          italic: false,
          strikethrough: false,
          underline: false,
          code: false,
          color: "default",
        },
      },
    ],
  },
});

describe("GET /notion/component-guide", () => {
  beforeEach(() => {
    vi.stubEnv("NOTION_API_KEY", "test-notion-key");
    clearComponentGuideCache();
    nock.cleanAll();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    nock.cleanAll();
  });

  it("returns markdown converted from the page's Notion blocks", async () => {
    nock(NOTION_HOST)
      .get(childrenPath(COMPONENT_GUIDE_PAGE_ID))
      .query(true)
      .reply(200, {
        results: [
          {
            id: "h",
            type: "heading_2",
            has_children: false,
            heading_2: {
              rich_text: [
                {
                  plain_text: "Overview",
                  href: null,
                  annotations: {
                    bold: false,
                    italic: false,
                    strikethrough: false,
                    underline: false,
                    code: false,
                    color: "default",
                  },
                },
              ],
            },
          },
          paragraph("First line."),
          paragraph("Second line."),
        ],
        next_cursor: null,
        has_more: false,
      });

    await supertest(app)
      .get("/notion/component-guide")
      .expect(200)
      .then((res) => {
        expect(res.body.markdown).toBe(
          "## Overview\n\nFirst line.\n\nSecond line.",
        );
        expect(res.body.fetchedAt).toEqual(expect.any(String));
      });
  });

  it("recursively fetches nested blocks", async () => {
    nock(NOTION_HOST)
      .get(childrenPath(COMPONENT_GUIDE_PAGE_ID))
      .query(true)
      .reply(200, {
        results: [
          {
            id: "toggle-1",
            type: "toggle",
            has_children: true,
            toggle: {
              rich_text: [
                {
                  plain_text: "More detail",
                  href: null,
                  annotations: {
                    bold: false,
                    italic: false,
                    strikethrough: false,
                    underline: false,
                    code: false,
                    color: "default",
                  },
                },
              ],
            },
          },
        ],
        next_cursor: null,
        has_more: false,
      });
    nock(NOTION_HOST)
      .get(childrenPath("toggle-1"))
      .query(true)
      .reply(200, {
        results: [paragraph("Hidden content.")],
        next_cursor: null,
        has_more: false,
      });

    await supertest(app)
      .get("/notion/component-guide")
      .expect(200)
      .then((res) => {
        expect(res.body.markdown).toBe("**More detail**\n\nHidden content.");
      });
  });

  it("serves a cached response without re-calling Notion", async () => {
    const scope = nock(NOTION_HOST)
      .get(childrenPath(COMPONENT_GUIDE_PAGE_ID))
      .query(true)
      .reply(200, {
        results: [paragraph("Once only.")],
        next_cursor: null,
        has_more: false,
      });

    await supertest(app).get("/notion/component-guide").expect(200);
    await supertest(app)
      .get("/notion/component-guide")
      .expect(200)
      .then((res) => expect(res.body.markdown).toBe("Once only."));

    expect(scope.isDone()).toBe(true);
    expect(nock.pendingMocks()).toHaveLength(0);
  });

  it("returns a 500 when NOTION_API_KEY is not configured", async () => {
    vi.stubEnv("NOTION_API_KEY", "");

    await supertest(app)
      .get("/notion/component-guide")
      .expect(500)
      .then((res) => {
        expect(res.body.error).toMatch(/NOTION_API_KEY is not set/);
      });
  });

  it("surfaces an upstream Notion failure as a 502", async () => {
    nock(NOTION_HOST)
      .get(childrenPath(COMPONENT_GUIDE_PAGE_ID))
      .query(true)
      .reply(401, { message: "API token is invalid." });

    await supertest(app).get("/notion/component-guide").expect(502);
  });
});
