import { MockedProvider } from "@apollo/client/testing";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-helper";
import { uniqueId } from "lodash";
import React from "react";

import findAddressReturnMock from "../FindProperty/Public/mocks/findAddressReturnMock";
import { fillInFieldsUsingPlaceholder } from "../shared/testHelpers";
import AddressInput from "./Public";

test("submits an address", async () => {
  const handleSubmit = jest.fn();

  render(
    <MockedProvider mocks={findAddressReturnMock}>
      <AddressInput handleSubmit={handleSubmit} title="" fn="foo" />
    </MockedProvider>
  );

  await waitFor(async () => {
    await fillInFieldsUsingPlaceholder({
      "Line 1": "Flat 1",
      "Line 2": "221b Baker St",
      Town: "London",
      County: "County",
      Postcode: "SW1A 2AA",
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

test("recovers previously submitted text when clicking the back button", async () => {
  const handleSubmit = jest.fn();
  const componentId = uniqueId();

  render(
    <MockedProvider mocks={findAddressReturnMock}>
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
    </MockedProvider>
  );

  await waitFor(async () => {
    await fillInFieldsUsingPlaceholder({
      "Line 2": "221b Baker St",
    });

    userEvent.click(screen.getByText("Continue"));
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
    <MockedProvider mocks={findAddressReturnMock}>
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
    </MockedProvider>
  );

  await waitFor(async () => {
    await fillInFieldsUsingPlaceholder({
      "Line 2": "221b Baker St",
    });

    userEvent.click(screen.getByText("Continue"));
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

it("should not have any accessibility violations", async () => {
  const { container } = render(
    <MockedProvider mocks={findAddressReturnMock}>
      <AddressInput title="title" />
    </MockedProvider>
  );
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
