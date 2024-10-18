import { MyMap } from "@opensystemslab/map";
import React from "react";
import { setup } from "testUtils";
import { it, vi } from "vitest";

import { point1, point2, point3 } from "../test/mocks/geojson";
import {
  previousDoubleDataProps,
  previousSingleDataProps,
} from "../test/mocks/Trees";
import { addFeaturesToMap, addMultipleFeatures } from "../test/utils";
import { Presentational as MapAndLabel } from ".";

beforeAll(() => {
  if (!window.customElements.get("my-map")) {
    window.customElements.define("my-map", MyMap);
  }

  const ResizeObserverMock = vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  vi.stubGlobal("ResizeObserver", ResizeObserverMock);
});

describe("navigating back after adding single feature", () => {
  it("shows previously submitted features", async () => {
    const { getByTestId, queryByRole, user } = setup(
      <MapAndLabel {...previousSingleDataProps} />,
    );
    const map = getByTestId("map-and-label-map");

    expect(map).toBeInTheDocument();

    const firstTab = queryByRole("tab", { name: /Tree 1/ });
    expect(firstTab).toBeInTheDocument();
    expect(firstTab).toBeVisible();

    const firstTabPanel = getByTestId("vertical-tabpanel-0");
    expect(firstTabPanel).toBeInTheDocument();
    expect(firstTabPanel).toBeVisible();

    // point1 here needs to be reflected in the props you pass in at the start so labels match
    addMultipleFeatures([point1, point2]);

    const secondTab = queryByRole("tab", { name: /Tree 2/ });
    expect(secondTab).toBeInTheDocument();
    expect(secondTab).toBeVisible();
  });
});

describe("navigating back after adding two features", () => {
  it("shows previously submitted features", async () => {
    const { getByTestId, queryByRole, user } = setup(
      <MapAndLabel {...previousDoubleDataProps} />,
    );
    const map = getByTestId("map-and-label-map");

    expect(map).toBeInTheDocument();

    const firstTab = queryByRole("tab", { name: /Tree 1/ });
    const secondTab = queryByRole("tab", { name: /Tree 2/ });
    expect(firstTab).toBeInTheDocument();
    expect(secondTab).toBeInTheDocument();

    const firstTabPanel = getByTestId("vertical-tabpanel-0");
    const secondTabPanel = getByTestId("vertical-tabpanel-1");
    expect(firstTabPanel).toBeInTheDocument();
    expect(secondTabPanel).toBeInTheDocument();
    expect(secondTabPanel).toBeVisible();

    addMultipleFeatures([point1, point2, point3]);

    const thirdTab = queryByRole("tab", { name: /Tree 3/ });
    expect(thirdTab).toBeInTheDocument();
    expect(thirdTab).toBeVisible();
  });
});
