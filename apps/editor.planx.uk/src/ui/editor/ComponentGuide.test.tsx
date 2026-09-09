import type { User } from "@opensystemslab/planx-core/types";
import { act, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import server from "test/mockServer";
import { setup } from "test/utils";

import ComponentGuide from "./ComponentGuide";

const { setState } = useStore;

const DEFAULT_PAGE_ID = "3d6a3c448ac280baa77bd6dc264906b8";
const MARKDOWN = "## Overview\n\nUse this component to ask a single question.";

const pageIdSpy = vi.fn();

const mockUser: Omit<User, "isPlatformAdmin"> = {
  id: 200,
  firstName: "Testy",
  lastName: "McTester",
  email: "test@email.com",
  teams: [],
  isAnalyst: false,
  defaultTeamId: null,
};

beforeEach(() => {
  pageIdSpy.mockClear();
  window.localStorage.clear();
  server.use(
    http.get("*/notion/component-guide", ({ request }) => {
      const pageId =
        new URL(request.url).searchParams.get("pageId") ?? DEFAULT_PAGE_ID;
      pageIdSpy(pageId);
      return HttpResponse.json({
        markdown: MARKDOWN,
        fetchedAt: "2026-09-09T00:00:00.000Z",
        pageId,
      });
    }),
  );
});

afterEach(() => {
  window.localStorage.clear();
  act(() => setState({ user: undefined }));
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

test("upgrades a YouTube link to a no-cookie embed iframe", async () => {
  server.use(
    http.get("*/notion/component-guide", () =>
      HttpResponse.json({
        markdown: "[Watch](https://www.youtube.com/watch?v=dQw4w9WgXcQ)",
        fetchedAt: "2026-09-09T00:00:00.000Z",
        pageId: DEFAULT_PAGE_ID,
      }),
    ),
  );

  setup(<ComponentGuide />);

  const frame = await screen.findByTitle("Watch");
  expect(frame).toHaveAttribute(
    "src",
    "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
  );
});

describe("Notion page ID config (platform admins)", () => {
  beforeEach(() =>
    act(() =>
      setState({
        user: { ...mockUser, isPlatformAdmin: true },
        teamSlug: "team",
      }),
    ),
  );

  test("is hidden for non platform admins", async () => {
    act(() => setState({ user: { ...mockUser, isPlatformAdmin: false } }));
    setup(<ComponentGuide />);

    await screen.findByRole("heading", { name: "Overview" });
    expect(screen.queryByLabelText(/notion page id/i)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Save" }),
    ).not.toBeInTheDocument();
  });

  test("Save is disabled until the input differs from the active page", async () => {
    const { user } = await setup(<ComponentGuide />);
    await screen.findByRole("heading", { name: "Overview" });

    const saveButton = screen.getByRole("button", { name: "Save" });
    // Field is pre-filled with the active page id, so nothing to save yet
    expect(saveButton).toBeDisabled();

    const input = screen.getByPlaceholderText(/notion page id or url/i);
    await user.type(input, "x");
    expect(saveButton).toBeEnabled();

    // Editing back to the original value disables it again
    await user.type(input, "{backspace}");
    expect(saveButton).toBeDisabled();
  });

  test("saving an ID refetches from that page and persists it", async () => {
    const { user } = await setup(<ComponentGuide />);
    await screen.findByRole("heading", { name: "Overview" });
    expect(pageIdSpy).toHaveBeenLastCalledWith(DEFAULT_PAGE_ID);

    const input = screen.getByPlaceholderText(/notion page id or url/i);
    await user.clear(input);
    // paste a full Notion URL - the id should be extracted from it
    await user.type(
      input,
      "https://ianjo.notion.site/Section-0123456789abcdef0123456789abcdef",
    );
    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(pageIdSpy).toHaveBeenLastCalledWith(
        "0123456789abcdef0123456789abcdef",
      ),
    );
    expect(window.localStorage.getItem("componentGuide:notionPageId")).toBe(
      "0123456789abcdef0123456789abcdef",
    );
  });

  test("a blank input means no content and skips the API", async () => {
    const { user } = await setup(<ComponentGuide />);
    await screen.findByRole("heading", { name: "Overview" });
    expect(pageIdSpy).toHaveBeenCalledTimes(1);

    const input = screen.getByPlaceholderText(/notion page id or url/i);
    await user.clear(input);
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(
      await screen.findByText(/no guidance is set for this component/i),
    ).toBeVisible();
    expect(
      screen.queryByRole("heading", { name: "Overview" }),
    ).not.toBeInTheDocument();
    expect(window.localStorage.getItem("componentGuide:notionPageId")).toBe("");
    expect(pageIdSpy).toHaveBeenCalledTimes(1); // no extra fetch
  });

  test("a saved override persists across remounts", async () => {
    window.localStorage.setItem(
      "componentGuide:notionPageId",
      "0123456789abcdef0123456789abcdef",
    );

    await setup(<ComponentGuide />);
    await screen.findByRole("heading", { name: "Overview" });
    expect(pageIdSpy).toHaveBeenLastCalledWith(
      "0123456789abcdef0123456789abcdef",
    );
  });

  test("rejects input with no recognisable Notion ID", async () => {
    const { user } = await setup(<ComponentGuide />);
    await screen.findByRole("heading", { name: "Overview" });

    const input = screen.getByPlaceholderText(/notion page id or url/i);
    await user.clear(input);
    await user.type(input, "not an id");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(
      await screen.findByText(/enter a notion page id or url/i),
    ).toBeVisible();
    expect(pageIdSpy).toHaveBeenCalledTimes(1); // only the initial load
  });
});
