import { SendIntegration } from "@opensystemslab/planx-core/types";
import { waitFor } from "@testing-library/react";
import axios from "axios";
import { FullStore, useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { act } from "react-dom/test-utils";
import { setup } from "testUtils";
import { vi } from "vitest";
import { axe } from "vitest-axe";

import hasuraEventsResponseMock from "./mocks/hasuraEventsResponseMock";
import { flow } from "./mocks/simpleFlow";
import SendComponent from "./Public";

const { getState, setState } = useStore;

let initialState: FullStore;

/**
 * Adds a small tick to allow MUI to render (e.g. card transitions)
 */
const tick = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

vi.mock("axios");
const mockAxios = vi.mocked(axios, true);

mockAxios.post.mockResolvedValue({
  data: hasuraEventsResponseMock,
  status: 200,
  statusText: "OK",
});

const originalLocation = window.location.pathname;

beforeAll(() => (initialState = getState()));

beforeEach(() => act(() => setState({ teamSlug: "testTeam" })));

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
  let resolvePromise: (value: any) => void;
  const promise = new Promise((resolve) => {
    resolvePromise = resolve;
  });

  mockAxios.post.mockImplementationOnce(() => promise);

  const { getByText } = setup(
    <SendComponent title="Send" destinations={["bops", "uniform"]} />,
  );

  await tick();

  // Initial loading state
  expect(getByText(/Submitting your application.../)).toBeVisible();

  // Trigger mock API response
  resolvePromise!({
    data: hasuraEventsResponseMock,
    status: 200,
    statusText: "OK",
  });

  expect(mockAxios.post).toHaveBeenCalledTimes(1);

  await tick();

  // Final submission state
  expect(getByText(/Finalising your submission.../)).toBeVisible();
});

it("calls the /create-send-event endpoint", async () => {
  setup(<SendComponent title="Send" destinations={["bops", "uniform"]} />);

  await waitFor(() => expect(mockAxios.post).toHaveBeenCalledTimes(1));

  expect(mockAxios.post).toHaveBeenCalledTimes(1);
});

it("generates a valid payload for the API", async () => {
  const destinations: SendIntegration[] = ["bops", "uniform"];

  setup(<SendComponent title="Send" destinations={destinations} />);

  await waitFor(() => expect(mockAxios.post).toHaveBeenCalledTimes(1));

  const apiPayload = mockAxios.post.mock.calls[0][1];

  destinations.forEach((destination) => {
    expect(apiPayload).toHaveProperty(destination);
    expect(
      (apiPayload as Record<SendIntegration, unknown>)[destination],
    ).toHaveProperty("localAuthority", "testTeam");
  });
});

describe("Uniform overrides for Buckinghamshire", () => {
  it("converts property.localAuthorityDistrict to the correct format", async () => {
    act(() =>
      setState({
        teamSlug: "buckinghamshire",
        flow,
        breadcrumbs: {
          findProperty: {
            data: {
              "property.localAuthorityDistrict": [
                "Buckinghamshire",
                "Historic district name",
              ],
            },
          },
        },
      }),
    );

    setup(<SendComponent title="Send" destinations={["bops", "uniform"]} />);

    await waitFor(() => expect(mockAxios.post).toHaveBeenCalledTimes(1));

    const apiPayload = mockAxios.post.mock.calls[0][1] as any;

    // BOPS event not modified
    expect(apiPayload?.bops?.localAuthority).toEqual("buckinghamshire");

    // Uniform event has read property.localAuthorityDistrict from the passport
    expect(apiPayload?.uniform?.localAuthority).toEqual(
      "historic-district-name",
    );
  });

  it("maps requests for South Bucks to Chiltern", async () => {
    act(() =>
      setState({
        teamSlug: "buckinghamshire",
        flow,
        breadcrumbs: {
          findProperty: {
            data: {
              "property.localAuthorityDistrict": ["South Bucks"],
            },
          },
        },
      }),
    );

    setup(<SendComponent title="Send" destinations={["bops", "uniform"]} />);

    await waitFor(() => expect(mockAxios.post).toHaveBeenCalledTimes(1));

    const apiPayload = mockAxios.post.mock.calls[0][1] as any;

    expect(apiPayload?.uniform?.localAuthority).toEqual("chiltern");
  });
});

it("generates a valid breadcrumb", async () => {
  const handleSubmit = vi.fn();

  setup(
    <SendComponent
      title="Send"
      destinations={["bops", "uniform"]}
      handleSubmit={handleSubmit}
    />,
  );

  await waitFor(() => expect(mockAxios.post).toHaveBeenCalledTimes(1));
  expect(handleSubmit).toHaveBeenCalledTimes(1);

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
