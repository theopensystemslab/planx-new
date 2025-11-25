import { MyMap } from "@opensystemslab/map";
import React from "react";
import { setup } from "testUtils";
import { it, vi } from "vitest";

import { Presentational as MapAndLabel } from "../Public";
import { point1, point2, point3 } from "./mocks/geojson";
import {
  previouslySubmittedDoubleFeatureProps,
  previouslySubmittedSingleFeatureProps,
} from "./mocks/SketchPlanCA";
import { addMultipleFeatures, clickContinue } from "./utils";

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
    const { getByTestId, queryByRole } = await setup(
      <MapAndLabel {...previouslySubmittedSingleFeatureProps} />,
    );
    const map = getByTestId("map-and-label-map");

    expect(map).toBeInTheDocument();

    const firstTab = queryByRole("tab", { name: /Tree 1/ });
    expect(firstTab).toBeVisible();

    const firstTabPanel = getByTestId("vertical-tabpanel-0");
    expect(firstTabPanel).toBeVisible();

    // To properly add the features to the map, you need to pass all previous features as well
    addMultipleFeatures([point1, point2]);

    const secondTab = queryByRole("tab", { name: /Tree 2/ });
    expect(secondTab).toBeVisible();

    const secondTabPanel = getByTestId("vertical-tabpanel-1");
    expect(secondTabPanel).toBeVisible();
  });
});

describe("navigating back after adding two features", () => {
  it("shows previously submitted features", async () => {
    const { getByTestId, queryByRole } = await setup(
      <MapAndLabel {...previouslySubmittedDoubleFeatureProps} />,
    );
    const map = getByTestId("map-and-label-map");

    expect(map).toBeInTheDocument();

    const firstTab = queryByRole("tab", { name: /Tree 1/ });
    const secondTab = queryByRole("tab", { name: /Tree 2/ });
    expect(firstTab).toBeInTheDocument();
    expect(secondTab).toBeInTheDocument();

    const secondTabPanel = getByTestId("vertical-tabpanel-1");
    expect(secondTabPanel).toBeVisible();

    // To properly add the features to the map, you need to pass all previous features as well
    addMultipleFeatures([point1, point2, point3]);

    const thirdTab = queryByRole("tab", { name: /Tree 3/ });
    expect(thirdTab).toBeVisible();

    const thirdTabPanel = getByTestId("vertical-tabpanel-2");
    expect(thirdTabPanel).toBeVisible();
  });
  it("should maintain labelling when removing a feature", async () => {
    const handleSubmit = vi.fn();
    const { getByRole, user } = await setup(
      <MapAndLabel
        {...previouslySubmittedDoubleFeatureProps}
        handleSubmit={handleSubmit}
      />,
    );

    const firstTab = getByRole("tab", { name: /Tree 1/ });

    await user.click(firstTab);

    const removeButton = getByRole("button", { name: /remove/i });

    await user.click(removeButton);

    await clickContinue(user);

    const output =
      handleSubmit.mock.calls[0][0].data.MockFn.features[0].properties.label;

    expect(output).toEqual("1");
  });
});
