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

it("should not have any accessibility violations", async () => {
  const { container } = setup(
    <ConfirmationComponent
      color={{ text: "#000", background: "rgba(1, 99, 96, 0.1)" }}
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

it.todo("should hide the 'Continue' button if it's the final card in the flow");

it.todo(
  "should show the 'Continue' button if it is not the final card in the flow",
);
