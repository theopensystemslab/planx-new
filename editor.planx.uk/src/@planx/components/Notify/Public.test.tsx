import { render } from "@testing-library/react";
import axe from "axe-helper";
import React from "react";

import Public from "./Public";

test("renders", async () => {
  const handleSubmit = jest.fn();
  render(
    <Public
      handleSubmit={handleSubmit}
      token="placeholder"
      templateId="placeholder"
      personalisation={{}}
      addressee="placeholder"
    />
  );
});

it("should not have any accessibility violations", async () => {
  const { container } = render(
    <Public
      token="placeholder"
      templateId="placeholder"
      personalisation={{}}
      addressee="placeholder"
    />
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

// XXX: Further tests such as
//      1) It throws an error
//      2) It shows the loading screen
//      3) It sends an email
//      are not being written today as this whole logic will be deprecated
//      in favour of a backend-based implementation.
