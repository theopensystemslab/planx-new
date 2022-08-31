import { act, render } from "@testing-library/react";
import React from "react";

import infiniteLoopBreadcrumbs from "./__tests__/mocks/infiniteLoopBreadcrumbs.json";
import infiniteLoopFlow from "./__tests__/mocks/infiniteLoopFlow.json";
import { AnalyticsProvider } from "./analyticsProvider";
import { vanillaStore } from "./store";

const { getState, setState } = vanillaStore;

beforeEach(() => {
  getState().resetPreview();
});

describe("AnalyticsProvider", () => {
  test("Should render children correctly when going back", () => {
    const breadcrumbs = infiniteLoopBreadcrumbs;
    const flow = infiniteLoopFlow;

    setState({
      flow,
      breadcrumbs,
    });

    const { queryByText } = render(<AnalyticsProvider>Test</AnalyticsProvider>);

    act(() => {
      // go back button simulation
      getState().record("eQJQlJJtuU");
    });

    expect(queryByText("Test")).toBeInTheDocument();
  });
});
