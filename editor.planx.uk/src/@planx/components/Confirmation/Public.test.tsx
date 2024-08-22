import React from "react";
import { setup } from "testUtils";
import { vi } from "vitest";
import { axe } from "vitest-axe";

import ConfirmationComponent from "./Public";

vi.mock("@opensystemslab/planx-core", () => {
  return {
    CoreDomainClient: vi.fn().mockImplementation(() => ({
      export: {
        csvData: () => vi.fn(),
      },
    })),
  };
});

it.skip("should not have any accessibility violations", async () => {
  const { container } = setup(
    <ConfirmationComponent
      heading="heading"
      description="description"
      nextSteps={[
        { title: "title1", description: "description1" },
        { title: "title2", description: "description2" },
        { title: "title3", description: "description3" },
      ]}
      moreInfo="more info"
      contactInfo="contact info"
    />,
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
