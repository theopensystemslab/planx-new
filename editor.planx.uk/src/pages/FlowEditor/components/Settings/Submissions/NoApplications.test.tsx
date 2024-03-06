import React from "react";
import { axe, setup } from "testUtils";

import NoApplications from "./NoApplications";

describe("NoApplications renders as expected", () => {
  test("renders no applications message", () => {
    const { getByText } = setup(<NoApplications />);
    expect(
      getByText("No submitted applications were found for this service."),
    ).toBeInTheDocument();
  });

  test("renders with no accessibility violations", async () => {
    const { container } = setup(<NoApplications />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
