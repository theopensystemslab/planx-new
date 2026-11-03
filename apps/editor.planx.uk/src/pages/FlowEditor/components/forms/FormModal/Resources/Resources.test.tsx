import { http, HttpResponse } from "msw";
import server from "test/mockServer";
import { setup } from "test/utils";

import Resources from ".";

const API_URL = import.meta.env.VITE_APP_API_URL;

const PAGE_ID = "3d6a3c44-8ac2-80ba-a77b-d6dc264906b8";
const TEXT_ID = "3d6a3c44-8ac2-80c3-9f8c-e6cdcbbc4aa9";
const LINKED_PAGE_ID = "3d6a3c44-8ac2-8078-a769-c490d5bc2811";

const mockRecordMap = {
  block: {
    [PAGE_ID]: {
      value: {
        value: {
          id: PAGE_ID,
          type: "page",
          properties: { title: [["Section"]] },
          content: [TEXT_ID, LINKED_PAGE_ID],
          parent_table: "space",
          alive: true,
        },
        role: "reader",
      },
    },
    [TEXT_ID]: {
      value: {
        value: {
          id: TEXT_ID,
          type: "text",
          properties: {
            title: [
              ["Sections organise your service into separate parts. "],
              ["Read the GOV.UK guidance", [["a", "https://www.gov.uk"]]],
            ],
          },
          parent_id: PAGE_ID,
          parent_table: "block",
          alive: true,
        },
        role: "reader",
      },
    },
    [LINKED_PAGE_ID]: {
      value: {
        value: {
          id: LINKED_PAGE_ID,
          type: "page",
          properties: { title: [["Components"]] },
          parent_id: PAGE_ID,
          parent_table: "block",
          alive: true,
        },
        role: "reader",
      },
    },
  },
  collection: {},
  collection_view: {},
  notion_user: {},
  collection_query: {},
  signed_urls: {},
};

describe("Resources tab", () => {
  it("renders guidance from Notion for a component with a guidance page", async () => {
    server.use(
      http.get(`${API_URL}/notion/page/:pageId`, () =>
        HttpResponse.json(mockRecordMap),
      ),
    );

    const { findByText } = await setup(<Resources type="section" />);

    expect(
      await findByText(/Sections organise your service into separate parts./),
    ).toBeInTheDocument();
  });

  it("opens links to other Notion pages on the public site in a new tab", async () => {
    server.use(
      http.get(`${API_URL}/notion/page/:pageId`, () =>
        HttpResponse.json(mockRecordMap),
      ),
    );

    const { findByRole } = await setup(<Resources type="section" />);

    const link = await findByRole("link", {
      name: /Components \(opens in a new tab\)/,
    });
    expect(link).toHaveAttribute(
      "href",
      `https://opensystemslab.notion.site/${LINKED_PAGE_ID.replaceAll("-", "")}`,
    );
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("opens external links in a new tab", async () => {
    server.use(
      http.get(`${API_URL}/notion/page/:pageId`, () =>
        HttpResponse.json(mockRecordMap),
      ),
    );

    const { findByRole } = await setup(<Resources type="section" />);

    const link = await findByRole("link", {
      name: /Read the GOV.UK guidance \(opens in a new tab\)/,
    });
    expect(link).toHaveAttribute("href", "https://www.gov.uk");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("shows a placeholder for a component without a guidance page", async () => {
    const { getByText } = await setup(<Resources type="note" />);

    expect(getByText("Guidance coming soon.")).toBeInTheDocument();
  });

  it("shows an error message if the page fails to load", async () => {
    server.use(
      http.get(`${API_URL}/notion/page/:pageId`, () =>
        HttpResponse.json({ error: "Failed" }, { status: 500 }),
      ),
    );

    const { findByText } = await setup(<Resources type="section" />);

    expect(
      await findByText("Unable to load guidance for this component."),
    ).toBeInTheDocument();
  });
});
