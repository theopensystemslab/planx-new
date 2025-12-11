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

const { getState, setState } = useStore;

let initialState: FullStore;

vi.spyOn(ReactNavi, "useNavigation").mockImplementation(
  () => ({ navigate: vi.fn() }) as any,
);

const handler = http.post(
  `${import.meta.env.VITE_APP_API_URL}/create-send-events/*`,
  async () => HttpResponse.json(hasuraEventsResponseMock, { status: 200 }),
);

const originalLocation = window.location.pathname;

beforeAll(() => (initialState = getState()));

beforeEach(() => {
  act(() => setState({ teamSlug: "testTeam" }));
  server.use(handler);
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

it("displays loading messages to the user", async () => {
  const handler = http.post(
    `${import.meta.env.VITE_APP_API_URL}/create-send-events/*`,
    async () => {
      // Add delay to allow us to test loading states
      await delay();
      return new HttpResponse(hasuraEventsResponseMock, { status: 200 });
    },
  );
  server.use(handler);

  const handleSubmit = vi.fn();
  const { findByText } = setup(
    <SendComponent
      title="Send"
      destinations={["bops", "uniform"]}
      handleSubmit={handleSubmit}
    />,
  );

  // Initial loading state
  expect(await findByText(/Sending your form.../)).toBeVisible();

  // Final submission state
  expect(await findByText(/Finalising your submission.../)).toBeVisible();

  await waitFor(() => expect(handleSubmit).toHaveBeenCalled());
});

it("generates a valid payload for the API", async () => {
  const destinations: SendIntegration[] = ["bops", "uniform"];
  const handleSubmit = vi.fn();

  let apiPayload: unknown = null;

  const handler = http.post(
    `${import.meta.env.VITE_APP_API_URL}/create-send-events/*`,
    async ({ request }) => {
      apiPayload = await request.json();
      return new HttpResponse(hasuraEventsResponseMock, { status: 200 });
    },
  );
  server.use(handler);

  setup(
    <SendComponent
      title="Send"
      destinations={destinations}
      handleSubmit={handleSubmit}
    />,
  );

  await waitFor(() => expect(handleSubmit).toHaveBeenCalledTimes(1));

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
  const handleSubmit = vi.fn();
  const { container } = setup(
    <SendComponent
      title="Send"
      destinations={["bops", "uniform"]}
      handleSubmit={handleSubmit}
    />,
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();

  await waitFor(() => expect(handleSubmit).toHaveBeenCalled());
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
      "Click continue to skip send and proceed with testing.",
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
