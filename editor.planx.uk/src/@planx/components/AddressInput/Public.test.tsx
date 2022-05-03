import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-helper";
import { uniqueId } from "lodash";
import React from "react";

import { ERROR_MESSAGE } from "../shared/constants";
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
      Postcode: "SW1A 2AA",
      Country: "United Kingdom",
    });

    await userEvent.click(screen.getByTestId("continue-button"));
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

test("recovers previously submitted text when clicking the back button", async () => {
  const handleSubmit = jest.fn();
  const componentId = uniqueId();

  render(
    <AddressInput
      handleSubmit={handleSubmit}
      title=""
      id={componentId}
      previouslySubmittedData={{
        data: {
          [componentId]: {
            line1: "Flat 1",
            line2: "",
            town: "London",
            county: "",
            postcode: "SW1A 2AA",
          },
        },
      }}
    />
  );

  await waitFor(async () => {
    await fillInFieldsUsingPlaceholder({
      "Line 2": "221b Baker St",
    });

    userEvent.click(screen.getByTestId("continue-button"));
  });

  expect(handleSubmit).toHaveBeenCalledWith({
    data: {
      [componentId]: {
        line1: "Flat 1",
        line2: "221b Baker St",
        town: "London",
        county: "",
        postcode: "SW1A 2AA",
      },
    },
  });
});

test("recovers previously submitted text when clicking the back button even if a data field is set", async () => {
  const handleSubmit = jest.fn();
  const componentId = uniqueId();
  const dataField = "data-field";

  render(
    <AddressInput
      handleSubmit={handleSubmit}
      title=""
      fn={dataField}
      id={componentId}
      previouslySubmittedData={{
        data: {
          [dataField]: {
            line1: "Flat 1",
            line2: "",
            town: "London",
            county: "",
            postcode: "SW1A 2AA",
          },
        },
      }}
    />
  );

  await waitFor(async () => {
    await fillInFieldsUsingPlaceholder({
      "Line 2": "221b Baker St",
    });

    userEvent.click(screen.getByTestId("continue-button"));
  });

  expect(handleSubmit).toHaveBeenCalledWith({
    data: {
      [dataField]: {
        line1: "Flat 1",
        line2: "221b Baker St",
        town: "London",
        county: "",
        postcode: "SW1A 2AA",
      },
    },
  });
});

it("should not have any accessibility violations on initial load", async () => {
  const { container } = render(<AddressInput title="title" />);
  await waitFor(async () => {
    await fillInFieldsUsingPlaceholder({
      "Line 1": "Flat 1",
      "Line 2": "221b Baker St",
      Town: "London",
      County: "County",
      Postcode: "SW1A 2AA",
      Country: "United Kingdom",
    });
  });
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

it("should not have any accessibility violations whilst in the error state", async () => {
  const { container } = render(<AddressInput title="title" id="testId" />);

  const requiredAddressElements = ["line1", "town", "postcode"];

  requiredAddressElements.forEach((el) => {
    const errorMessage = container.querySelector(
      `#${ERROR_MESSAGE}-testId-${el}`
    );
    expect(errorMessage).toBeEmptyDOMElement();
  });

  await waitFor(async () => {
    // This should trigger multiple ErrorWrappers to display as the form is empty
    userEvent.click(screen.getByTestId("continue-button"));
  });

  requiredAddressElements.forEach((el) => {
    const errorMessage = container.querySelector(
      `#${ERROR_MESSAGE}-testId-${el}`
    );
    expect(errorMessage).not.toBeEmptyDOMElement();
  });

  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
