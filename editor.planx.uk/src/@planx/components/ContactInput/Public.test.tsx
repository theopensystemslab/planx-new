import { screen, waitFor } from "@testing-library/react";
import { uniqueId } from "lodash";
import React from "react";
import { axe, setup } from "testUtils";

import { ERROR_MESSAGE } from "../shared/constants";
import { fillInFieldsUsingLabel } from "../shared/testHelpers";
import ContactInput from "./Public";

test("submits contact data", async () => {
  const handleSubmit = jest.fn();
  const dataField = "applicant";

  const { user } = setup(
    <ContactInput
      handleSubmit={handleSubmit}
      title="Enter your contact details"
      fn={dataField}
    />
  );

  await fillInFieldsUsingLabel(user, {
    "Title (optional)": "Mme",
    "First name": "Jane",
    "Last name": "Doe",
    "Organisation (optional)": "Local planning authority",
    "Phone number": "0123456789",
    "Email address": "jane@gov.uk",
  });

  await user.click(screen.getByTestId("continue-button"));

  expect(handleSubmit).toHaveBeenCalledWith({
    data: {
      [`_contact.${dataField}`]: {
        [dataField]: {
          title: "Mme",
          firstName: "Jane",
          lastName: "Doe",
          organisation: "Local planning authority",
          phone: "0123456789",
          email: "jane@gov.uk",
        },
      },
      // handleSubmit has also mapped internal values to top-level expected passport variables
      [`${dataField}.title`]: "Mme",
      [`${dataField}.name.first`]: "Jane",
      [`${dataField}.name.last`]: "Doe",
      [`${dataField}.company.name`]: "Local planning authority",
      [`${dataField}.phone.primary`]: "0123456789",
      [`${dataField}.email`]: "jane@gov.uk",
    },
  });
});

test("recovers previously submitted text when clicking the back button", async () => {
  const handleSubmit = jest.fn();
  const componentId = uniqueId();
  const dataField = "applicant";

  const { user } = setup(
    <ContactInput
      handleSubmit={handleSubmit}
      title="Enter your contact details"
      id={componentId}
      fn={dataField}
      previouslySubmittedData={{
        data: {
          [`_contact.${dataField}`]: {
            [dataField]: {
              title: "Mme",
              firstName: "Jane",
              lastName: "Doe",
              organisation: "",
              phone: "0123456789",
              email: "jane@gov.uk",
            },
          },
          [`${dataField}.title`]: "Mme",
          [`${dataField}.name.first`]: "Jane",
          [`${dataField}.name.last`]: "Doe",
          [`${dataField}.phone.primary`]: "0123456789",
          [`${dataField}.email`]: "jane@gov.uk",
        },
      }}
    />
  );

  await fillInFieldsUsingLabel(user, {
    "Organisation (optional)": "Local planning authority",
  });

  await user.click(screen.getByTestId("continue-button"));

  expect(handleSubmit).toHaveBeenCalledWith({
    data: {
      [`_contact.${dataField}`]: {
        [dataField]: {
          title: "Mme",
          firstName: "Jane",
          lastName: "Doe",
          organisation: "Local planning authority",
          phone: "0123456789",
          email: "jane@gov.uk",
        },
      },
      // handleSubmit has also mapped internal values to top-level expected passport variables
      [`${dataField}.title`]: "Mme",
      [`${dataField}.name.first`]: "Jane",
      [`${dataField}.name.last`]: "Doe",
      [`${dataField}.company.name`]: "Local planning authority",
      [`${dataField}.phone.primary`]: "0123456789",
      [`${dataField}.email`]: "jane@gov.uk",
    },
  });
});

test("recovers previously submitted text when clicking the back button when a passport field is set", async () => {
  const handleSubmit = jest.fn();
  const componentId = uniqueId();
  const dataField = "applicant.agent";

  const { user } = setup(
    <ContactInput
      handleSubmit={handleSubmit}
      title=""
      fn={dataField}
      id={componentId}
      previouslySubmittedData={{
        data: {
          [`_contact.${dataField}`]: {
            [dataField]: {
              title: "Mme",
              firstName: "Jane",
              lastName: "Doe",
              organisation: "",
              phone: "0123456789",
              email: "jane@gov.uk",
            },
          },
          [`${dataField}.title`]: "Mme",
          [`${dataField}.name.first`]: "Jane",
          [`${dataField}.name.last`]: "Doe",
          [`${dataField}.phone.primary`]: "0123456789",
          [`${dataField}.email`]: "jane@gov.uk",
        },
      }}
    />
  );

  await fillInFieldsUsingLabel(user, {
    "Organisation (optional)": "Local planning authority",
  });

  await user.click(screen.getByTestId("continue-button"));

  expect(handleSubmit).toHaveBeenCalledWith({
    data: {
      [`_contact.${dataField}`]: {
        [dataField]: {
          title: "Mme",
          firstName: "Jane",
          lastName: "Doe",
          organisation: "Local planning authority",
          phone: "0123456789",
          email: "jane@gov.uk",
        },
      },
      // handleSubmit has also mapped internal values to top-level expected passport variables
      [`${dataField}.title`]: "Mme",
      [`${dataField}.name.first`]: "Jane",
      [`${dataField}.name.last`]: "Doe",
      [`${dataField}.company.name`]: "Local planning authority",
      [`${dataField}.phone.primary`]: "0123456789",
      [`${dataField}.email`]: "jane@gov.uk",
    },
  });
});

it("should not have any accessibility violations on initial load", async () => {
  const { container, user } = setup(<ContactInput title="title" />);
  await fillInFieldsUsingLabel(user, {
    "Title (optional)": "Mme",
    "First name": "Jane",
    "Last name": "Doe",
    "Organisation (optional)": "DLUHC",
    "Phone number": "0123456789",
    "Email address": "jane@gov.uk",
  });
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

it("should not have any accessibility violations while in the error state", async () => {
  const { container, user } = setup(
    <ContactInput title="Enter your contact details" id="testId" />
  );

  const requiredContactElements = ["firstName", "lastName", "phone", "email"];

  requiredContactElements.forEach((el) => {
    const errorMessage = screen.getByTestId(`${ERROR_MESSAGE}-testId-${el}`);
    expect(errorMessage).toBeEmptyDOMElement();
  });

  // This should trigger multiple ErrorWrappers to display as the form is empty
  await user.click(screen.getByTestId("continue-button"));

  for (const el of requiredContactElements) {
    const errorMessage = await screen.findByTestId(
      `${ERROR_MESSAGE}-testId-${el}`
    );
    await waitFor(() => expect(errorMessage).not.toBeEmptyDOMElement());
  }

  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

test("does not allow the name 'Test Test' to be used", async () => {
  const handleSubmit = jest.fn();
  const dataField = "applicant";

  const { user } = setup(
    <ContactInput
      handleSubmit={handleSubmit}
      title="Enter your contact details"
      fn={dataField}
    />
  );

  await fillInFieldsUsingLabel(user, {
    "First name": "Test",
    "Last name": "Test",
    "Phone number": "0123456789",
    "Email address": "test@gov.uk",
  });

  await user.click(screen.getByTestId("continue-button"));

  expect(handleSubmit).not.toHaveBeenCalled();

  const errorMessage = await screen.findByText(
    "'Test Test' is not a valid name - please submit test applications via the staging environment"
  );
  expect(errorMessage).toBeVisible();
});
