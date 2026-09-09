import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import React from "react";
import server from "test/mockServer";
import { setup } from "test/utils";

import ComponentGuide from "./ComponentGuide";

const MARKDOWN = "## Overview\n\nUse this component to ask a single question.";

beforeEach(() => {
  server.use(
    http.get("*/notion/component-guide", () =>
      HttpResponse.json({
        markdown: MARKDOWN,
        fetchedAt: "2026-09-09T00:00:00.000Z",
      }),
    ),
  );
});

test("renders the guidance markdown returned by the API", async () => {
  setup(<ComponentGuide />);

  expect(
    await screen.findByRole("heading", { name: "Overview" }),
  ).toBeVisible();
  expect(
    screen.getByText("Use this component to ask a single question."),
  ).toBeVisible();
});

test("shows a fallback message when the request fails", async () => {
  server.use(
    http.get("*/notion/component-guide", () =>
      HttpResponse.json(
        { error: "NOTION_API_KEY is not set" },
        { status: 500 },
      ),
    ),
  );

  setup(<ComponentGuide />);

  expect(await screen.findByText(/couldn't load the guidance/i)).toBeVisible();
});
