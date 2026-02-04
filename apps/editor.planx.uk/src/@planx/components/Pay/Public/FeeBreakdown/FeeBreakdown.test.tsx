import React from "react";
import { setup } from "testUtils";
import { axe } from "vitest-axe";

import { FeeBreakdown } from "./FeeBreakdown";

it("should not have any accessibility violations", async () => {
  const { container } = await setup(<FeeBreakdown />);
  const results = await axe(container);

  expect(results).toHaveNoViolations();
});

// Placeholder tests and initial assumptions
it.todo("displays a planning fee");

it.todo("displays a single total if VAT is not applicable");
it.todo(
  "displays VAT and total columns for each row if VAT is applicable to any row",
);

it.todo("displays a service charge if applicable");
it.todo("does not display a service charge if not applicable");

it.todo("displays a Fast Track fee if applicable");
it.todo("does not display a Fast Track fee if not applicable");

it.todo("displays a payment processing fee if applicable");
it.todo("does not display a payment processing fee if not applicable");

it.todo("displays exemptions if applicable");
it.todo("does not display exemptions if not applicable");

it.todo("displays negative reductions if applicable");
it.todo("displays positive reductions as 'modifications' if applicable");
it.todo("does not display reductions if not applicable");

it.todo("does not display if fee calculation values are invalid");
it.todo("silently throws an error if fee calculations are invalid");
