import { render } from "@testing-library/react";
import axe from "axe-helper";
import React from "react";

import ConfirmationComponent from "./Public";

it("should not have any accessibility violations", async () => {
  const { container } = render(
    <ConfirmationComponent
      heading="heading"
      description="description"
      details={{ key1: "something", key2: "something else" }}
      nextSteps={[
        { title: "title1", description: "description1" },
        { title: "title2", description: "description2" },
        { title: "title3", description: "description3" },
      ]}
      moreInfo="more info"
      contactInfo="contact info"
    />
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
