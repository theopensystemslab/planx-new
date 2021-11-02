import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import { fillInFieldsUsingPlaceholder } from "../shared/testHelpers";
import AddressInput from "./Public";

test("submits an address", async () => {
  const handleSubmit = jest.fn();

  render(<AddressInput handleSubmit={handleSubmit} title="" fn="foo" />);

  await waitFor(async () => {
    await fillInFieldsUsingPlaceholder({
      "Line 1": "Flat 1",
      "Line 2": "221b Baker St",
      Town: "London",
      County: "County",
      "Postal code": "SW1A 2AA",
      Country: "United Kingdom",
    });

    await userEvent.click(screen.getByText("Continue"));
  });

  expect(handleSubmit).toHaveBeenCalledWith({
    data: {
      foo: {
        line1: "Flat 1",
        line2: "221b Baker St",
        town: "London",
        county: "County",
        postcode: "SW1A 2AA",
        country: "United Kingdom",
      },
    },
  });
});
