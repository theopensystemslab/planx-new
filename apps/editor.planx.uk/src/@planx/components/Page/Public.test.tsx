import React from "react";
import { setup } from "testUtils";
import { vi } from "vitest";
import { axe } from "vitest-axe";

import PageComponent from "./Public";
import { ProposedAdvertisements } from "./schema/AdvertConsent";

it("renders correctly", async () => {
  const { getByRole } = await setup(
    <PageComponent
      handleSubmit={vi.fn()}
      schema={ProposedAdvertisements}
      fn="testFn"
      schemaName="Proposed advertisements"
      title="Tell us about your proposed advertisements"
    />,
  );

  const title = getByRole("heading", {
    level: 1,
    name: "Tell us about your proposed advertisements",
  });
  expect(title).toBeVisible();
});

it("has no accessibility violations", async () => {
  const { container } = await setup(
    <PageComponent
      handleSubmit={vi.fn()}
      schema={ProposedAdvertisements}
      fn="testFn"
      schemaName="Proposed advertisements"
      title="Tell us about your proposed advertisements"
    />,
  );

  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

it("displays the supplied Page schema", async () => {
  const { getByLabelText } = await setup(
    <PageComponent
      handleSubmit={vi.fn()}
      schema={ProposedAdvertisements}
      fn="testFn"
      schemaName="Proposed advertisements"
      title="Tell us about your proposed advertisements"
    />,
  );

  // Each PageSchema field is displayed
  ProposedAdvertisements.fields.forEach(({ data }) => {
    const input = getByLabelText(data.title);
    expect(input).toBeVisible();
  });
});

it("handles PageSchema errors", async () => {
  const handleSubmit = vi.fn();
  const {
    user,
    queryAllByTestId,
    getAllByTestId,
    getByTestId,
    queryByText,
    getAllByText,
  } = await setup(
    <PageComponent
      handleSubmit={handleSubmit}
      schema={ProposedAdvertisements}
      fn="testFn"
      schemaName="Proposed advertisements"
      title="Tell us about your proposed advertisements"
    />,
  );

  // No error messages present initially
  let errorMessages = queryAllByTestId(/error-message-input-number/);
  expect(
    queryByText("Enter your answer before continuing"),
  ).not.toBeInTheDocument();
  errorMessages.forEach((message) => expect(message).toBeEmptyDOMElement());

  // User hits "Continue" without populating fields
  const continueButton = getByTestId("continue-button");
  await user.click(continueButton);

  // Error messages present, per field
  errorMessages = getAllByTestId(/error-message-input-number/);
  errorMessages.forEach((message) => expect(message).not.toBeEmptyDOMElement());
  expect(getAllByText(/Enter your answer before continuing/)).toHaveLength(
    ProposedAdvertisements.fields.length,
  );

  // Due to errors, component has not submitted data
  expect(handleSubmit).not.toHaveBeenCalled();
});

it("submits a valid payload", async () => {
  const handleSubmit = vi.fn();
  const { user, getAllByLabelText, getByTestId } = await setup(
    <PageComponent
      handleSubmit={handleSubmit}
      schema={ProposedAdvertisements}
      fn="testFn"
      schemaName="Proposed advertisements"
      title="Tell us about your proposed advertisements"
    />,
  );

  const inputs = getAllByLabelText(/How many/);
  expect(inputs).toHaveLength(ProposedAdvertisements.fields.length);

  // Populate each field
  for (const input of inputs) {
    await user.type(input, "1");
  }

  const continueButton = getByTestId("continue-button");
  await user.click(continueButton);

  expect(handleSubmit).toHaveBeenCalled();

  const expectedFlattenedData = expect.objectContaining({
    data: expect.objectContaining({
      "testFn.fascia": 1,
      "testFn.hoarding": 1,
      "testFn.other": 1,
      "testFn.projecting": 1,
    }),
  });
  expect(handleSubmit).toHaveBeenCalledWith(expectedFlattenedData);

  const expectedDefaultData = expect.objectContaining({
    data: expect.objectContaining({
      testFn: [
        {
          fascia: 1,
          hoarding: 1,
          other: 1,
          projecting: 1,
        },
      ],
    }),
  });
  expect(handleSubmit).toHaveBeenCalledWith(expectedDefaultData);
});

it("handles back navigation", async () => {
  const previousData = {
    data: {
      testFn: [
        {
          fascia: 1,
          hoarding: 2,
          other: 3,
          projecting: 4,
        },
      ],
      "testFn.fascia": 1,
      "testFn.hoarding": 2,
      "testFn.other": 3,
      "testFn.projecting": 4,
    },
  };

  const handleSubmit = vi.fn();
  const { getByLabelText } = await setup(
    <PageComponent
      handleSubmit={handleSubmit}
      schema={ProposedAdvertisements}
      fn="testFn"
      schemaName="Proposed advertisements"
      title="Tell us about your proposed advertisements"
      previouslySubmittedData={previousData}
    />,
  );

  // Each input is correctly pre-populated
  const fasciaInput = getByLabelText(/fascia/);
  expect(fasciaInput).toHaveValue(1);

  const hoardingInput = getByLabelText(/hoarding/);
  expect(hoardingInput).toHaveValue(2);

  const otherInput = getByLabelText(/other/);
  expect(otherInput).toHaveValue(3);

  const projectingInput = getByLabelText(/projecting/);
  expect(projectingInput).toHaveValue(4);
});
