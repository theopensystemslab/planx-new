import {
  ComponentType as TYPES,
  DEFAULT_FLAG_CATEGORY,
  flatFlags,
} from "@opensystemslab/planx-core/types";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import React from "react";
import { setup } from "testUtils";
import { vi } from "vitest";

import Filter from "./Editor";

test("Adding a filter without explicit props uses the default flagset", async () => {
  const handleSubmit = vi.fn();

  setup(<Filter handleSubmit={handleSubmit} />);

  expect(screen.getByTestId("flagset-category-select")).toHaveValue(
    DEFAULT_FLAG_CATEGORY,
  );

  fireEvent.submit(screen.getByTestId("filter-component-form"));

  await waitFor(() =>
    expect(handleSubmit).toHaveBeenCalledWith(
      {
        type: TYPES.Filter,
        data: {
          fn: "flag",
          category: DEFAULT_FLAG_CATEGORY,
        },
      },
      mockDefaultFlagOptions,
    ),
  );
});

test("Adding a filter and selecting a flagset category", async () => {
  const handleSubmit = vi.fn();

  setup(<Filter handleSubmit={handleSubmit} />);

  expect(screen.getByTestId("flagset-category-select")).toHaveValue(
    DEFAULT_FLAG_CATEGORY,
  );

  fireEvent.change(screen.getByTestId("flagset-category-select"), {
    target: { value: "Community infrastructure levy" },
  });

  fireEvent.submit(screen.getByTestId("filter-component-form"));

  await waitFor(() =>
    expect(handleSubmit).toHaveBeenCalledWith(
      {
        type: TYPES.Filter,
        data: {
          fn: "flag",
          category: "Community infrastructure levy",
        },
      },
      mockCILFlagOptions,
    ),
  );
});

test.todo("Updating an existing filter to another category", async () => {
  const handleSubmit = vi.fn();

  setup(
    <Filter
      id="filterNodeId"
      category="Listed building consent"
      fn="flag"
      handleSubmit={handleSubmit}
    />,
  );

  expect(screen.getByTestId("flagset-category-select")).toHaveValue(
    "Listed building consent",
  );

  fireEvent.change(screen.getByTestId("flagset-category-select"), {
    target: { value: "Community infrastructure levy" },
  });

  fireEvent.submit(screen.getByTestId("filter-component-form"));

  await waitFor(() =>
    expect(handleSubmit).toHaveBeenCalledWith(
      {
        type: TYPES.Filter,
        data: {
          fn: "flag",
          category: "Community infrastructure levy",
        },
      },
      mockCILFlagOptions,
    ),
  );
});

const mockDefaultFlagOptions = [
  ...flatFlags.filter((flag) => flag.category === DEFAULT_FLAG_CATEGORY),
  {
    category: DEFAULT_FLAG_CATEGORY,
    text: "No flag result",
    value: "",
  },
].map((flag) => ({
  type: TYPES.Answer,
  data: {
    text: flag.text,
    val: flag.value,
  },
}));

const mockCILFlagOptions = [
  ...flatFlags.filter(
    (flag) => flag.category === "Community infrastructure levy",
  ),
  {
    category: "Community infrastructure levy",
    text: "No flag result",
    value: "",
  },
].map((flag) => ({
  type: TYPES.Answer,
  data: {
    text: flag.text,
    val: flag.value,
  },
}));
