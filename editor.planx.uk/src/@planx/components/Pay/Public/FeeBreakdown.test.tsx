import React from "react";
import { setup } from "testUtils";
import { vi } from "vitest";
import { axe } from "vitest-axe";

import { FeeBreakdown } from "./FeeBreakdown";

vi.mock("lib/featureFlags", () => ({
  hasFeatureFlag: () => true,
}));

it("should not have any accessibility violations", async () => {
  const { container } = setup(<FeeBreakdown />);
  const results = await axe(container);

  expect(results).toHaveNoViolations();
});

// Placeholder tests and initial assumptions
it.todo("displays a planning fee");

it.todo("displays a total");

it.todo("displays a service charge if applicable");
it.todo("does not display a service charge if not applicable");

it.todo("displays VAT if applicable");
it.todo("does not display VAT if not applicable");

it.todo("displays exemptions if applicable");
it.todo("does not exemptions if not applicable");

it.todo("displays reductions if applicable");
it.todo("does not reductions if not applicable");

it.todo("does not display if fee calculation values are invalid");
it.todo("silently throws an error if fee calculations are invalid");
