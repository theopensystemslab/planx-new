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

test("Adding a filter for the default flagset", async () => {
  const handleSubmit = vi.fn();

  setup(<Filter category="Planning Permssion" handleSubmit={handleSubmit} />);

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

test.todo("Adding a filter and picking a non-default flagset category");

test.todo("Updating an existing filter");

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
