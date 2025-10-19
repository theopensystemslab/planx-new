import { SendIntegration } from "@opensystemslab/planx-core/types";
import { waitFor } from "@testing-library/react";
import { delay, http, HttpResponse } from "msw";
import { FullStore, useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { act } from "react";
import * as ReactNavi from "react-navi";
import server from "test/mockServer";
import { setup } from "testUtils";
import { it, vi } from "vitest";
import { axe } from "vitest-axe";

import hasuraEventsResponseMock from "./mocks/hasuraEventsResponseMock";
import SendComponent from "./Public";

const ENDPOINT = `${import.meta.env.VITE_APP_API_URL}/create-send-events/:sessionId`;

const { getState, setState } = useStore;

let initialState: FullStore;

vi.spyOn(ReactNavi, "useNavigation").mockImplementation(
  () => ({ navigate: vi.fn() }) as any,
);

const handler = http.post(ENDPOINT, () =>
  HttpResponse.json(hasuraEventsResponseMock, { status: 200 }),
);

const originalLocation = window.location.pathname;

beforeAll(() => (initialState = getState()));

beforeEach(() => {
  server.use(handler);
  act(() => setState({ teamSlug: "testTeam" }));
});

afterEach(() => {
  vi.clearAllMocks();
  window.history.pushState({}, "", originalLocation);
  act(() => setState(initialState));
});

it("displays a warning at /draft URLs", () => {
  window.history.pushState({}, "", "/draft");
  const { getByText } = setup(
    <SendComponent title="Send" destinations={["bops", "uniform"]} />,
  );

  expect(getByText(/You can only test submissions on/)).toBeVisible();
});

it("displays a warning at /preview URLs", () => {
  window.history.pushState({}, "", "/preview");
  const { getByText } = setup(
    <SendComponent title="Send" destinations={["bops", "uniform"]} />,
  );

  expect(getByText(/You can only test submissions on/)).toBeVisible();
});

it("displays both loading states correctly", async () => {
  server.use(
    http.post(ENDPOINT, async () => {
      await delay(150);
      return HttpResponse.json(hasuraEventsResponseMock);
    }),
  );

  const { getByText, queryByText, findByText } = setup(
    <SendComponent title="Send" destinations={["bops", "uniform"]} />,
  );

  // Initial loading state
  expect(await findByText(/Submitting your application.../)).toBeVisible();

  // Final submission state
  expect(await findByText(/Finalising your submission.../)).toBeVisible();
});

it("generates a valid payload for the API", async () => {
  const destinations: SendIntegration[] = ["bops", "uniform"];

  let apiPayload: unknown = null;

  server.use(
    http.post(ENDPOINT, async ({ request }) => {
      apiPayload = await request.json();
      return HttpResponse.json(hasuraEventsResponseMock, { status: 200 });
    }),
  );

  await waitFor(() => expect(apiPayload).not.toBeNull());

  destinations.forEach((destination) => {
    expect(apiPayload).toHaveProperty(destination);
    expect(
      (apiPayload as Record<SendIntegration, unknown>)[destination],
    ).toHaveProperty("localAuthority", "testTeam");
  });
});

// Flaky test in CI so setting `retry` option
it("generates a valid breadcrumb", { retry: 1 }, async () => {
  const handleSubmit = vi.fn();

  setup(
    <SendComponent
      title="Send"
      destinations={["bops", "uniform"]}
      handleSubmit={handleSubmit}
    />,
  );

  await waitFor(() => expect(handleSubmit).toHaveBeenCalledTimes(1));

  const breadcrumb = handleSubmit.mock.calls[0][0];

  expect(breadcrumb.data).toEqual(
    expect.objectContaining({
      bopsSendEventId: hasuraEventsResponseMock.bops.event_id,
      uniformSendEventId: hasuraEventsResponseMock.uniform.event_id,
    }),
  );
});

it("should not have any accessibility violations", async () => {
  const { container } = setup(
    <SendComponent title="Send" destinations={["bops", "uniform"]} />,
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

describe("demo state", () => {
  beforeEach(() => {
    act(() =>
      setState({
        teamSlug: "demo",
      }),
    );
  });

  it("should render an error when teamSlug is demo", async () => {
    const { queryByText } = setup(
      <SendComponent title="Send" destinations={["bops", "uniform"]} />,
    );

    const errorHeader = queryByText(
      "Send is not enabled for services created in the Demo team",
    );
    const errorGuidance = queryByText(
      "Click continue to skip send and proceed with your application for testing.",
    );

    expect(errorHeader).toBeInTheDocument();
    expect(errorGuidance).toBeInTheDocument();
  });

  it("should allow the user to continue with their application", async () => {
    const handleSubmit = vi.fn();

    const { findByRole, user } = setup(
      <SendComponent
        title="Send"
        destinations={["bops", "uniform"]}
        handleSubmit={handleSubmit}
      />,
    );

    const continueButton = await findByRole("button", { name: "Continue" });
    expect(continueButton).toBeInTheDocument();

    await user.click(continueButton);
    expect(handleSubmit).toHaveBeenCalled();
  });
});
