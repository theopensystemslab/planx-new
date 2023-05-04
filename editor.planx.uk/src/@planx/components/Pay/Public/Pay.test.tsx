import { screen } from "@testing-library/react";
import React from "react";
import { axe, setup } from "testUtils";
import { PaymentStatus } from "types";

import Confirm, { Props } from "./Confirm";
import Pay from "./Pay";

it("renders correctly (is hidden) with <= £0 fee", () => {
  const handleSubmit = jest.fn();

  // if no props.fn, then fee defaults to 0
  setup(<Pay handleSubmit={handleSubmit} />);

  // handleSubmit is still called to set auto = true so Pay isn't seen in card sequence
  expect(handleSubmit).toHaveBeenCalled();
});

it("should not have any accessibility violations", async () => {
  const handleSubmit = jest.fn();
  const { container } = setup(<Pay handleSubmit={handleSubmit} />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

const defaultProps = {
  title: "Pay for your application",
  bannerTitle: "The fee is",
  description: "The fee covers the cost of processing your application",
  fee: 103,
  instructionsTitle: "How to pay",
  instructionsDescription: "Pay via GOV.UK Pay",
  buttonTitle: "Pay",
  onConfirm: jest.fn(),
  error: undefined,
  showInviteToPay: false,
};

describe("Confirm component without inviteToPay", () => {
  it("renders correctly", () => {
    setup(<Confirm {...defaultProps} />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Pay for your application"
    );
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "The fee is"
    );
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
      "How to pay"
    );
  });

  it("formats the fee with a currency symbol and two decimal places", () => {
    setup(<Confirm {...defaultProps} />);
    expect(screen.getByText("£103.00")).toBeInTheDocument();
  });

  it("correctly adjusts the heading heirarchy when the fee banner is hidden", async () => {
    setup(<Confirm {...{ ...defaultProps, hideFeeBanner: true }} />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Pay for your application"
    );
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "How to pay"
    );

    expect(screen.queryByText("The fee is")).not.toBeInTheDocument();
  });

  it("displays an error and continue-with-testing button if Pay is not enabled for this team", async () => {
    const handleSubmit = jest.fn();
    const errorMessage = "No pay token found for this team!";

    const { user } = setup(
      <Confirm
        {...defaultProps}
        error={errorMessage}
        onConfirm={handleSubmit}
      />
    );

    expect(screen.getByTestId("error-summary")).toBeInTheDocument();

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Pay for your application"
    );
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "The fee is"
    );
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
      errorMessage
    );

    expect(screen.getByText("Continue")).toBeInTheDocument();
    await user.click(screen.getByText("Continue"));
    expect(handleSubmit).toHaveBeenCalled();
  });

  it("should not have any accessibility violations", async () => {
    const { container } = setup(<Confirm {...defaultProps} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe("Confirm component with inviteToPay", () => {
  const inviteProps: Props = {
    ...defaultProps,
    showInviteToPay: true,
    nomineeTitle: "Details of your nominee",
    nomineeDescription: "Invite someone else to pay via GOV.UK Pay",
    paymentStatus: undefined,
  };

  const invitePrompt = "Invite someone else to pay for this application";
  const payPrompt = "I want to pay for this application myself";

  it("switches pages when you click the invite link", async () => {
    const { user } = setup(<Confirm {...inviteProps} />);

    // Land on "Pay" page by default
    expect(screen.getByText("How to pay")).toBeInTheDocument();
    expect(screen.getByText(invitePrompt)).toBeInTheDocument();

    // Click link to navigate to "InviteToPay" page
    await user.click(screen.getByText(invitePrompt));
    expect(screen.getByText("Details of your nominee")).toBeInTheDocument();
    expect(screen.getByText(payPrompt)).toBeInTheDocument();

    // Go back to "Pay page"
    await user.click(screen.getByText(payPrompt));
    expect(screen.getByText("How to pay")).toBeInTheDocument();
  });

  it("displays an error if you submit an invalid email address", async () => {
    const { user } = setup(<Confirm {...inviteProps} />);

    // Switch to "InviteToPay" page
    await user.click(screen.getByText(invitePrompt));
    expect(screen.getByText("Details of your nominee")).toBeInTheDocument();

    await user.type(await screen.findByLabelText("Email"), "jess@{enter}");
    expect(
      await screen.findByText(
        "Enter an email address in the correct format, like name@example.com"
      )
    ).toBeInTheDocument();
  });

  it("displays an error if do not submit a nominee name", async () => {
    const { user } = setup(<Confirm {...inviteProps} />);

    // Switch to "InviteToPay" page
    await user.click(screen.getByText(invitePrompt));
    expect(screen.getByText("Details of your nominee")).toBeInTheDocument();

    await user.type(
      await screen.findByLabelText("Email"),
      "test@opensystemslab.io{enter}"
    );
    expect(
      await screen.findByText("Enter the full name of the person paying")
    ).toBeInTheDocument();
  });

  it("displays an error if do not submit an applicant display name", async () => {
    const { user } = setup(<Confirm {...inviteProps} />);

    // Switch to "InviteToPay" page
    await user.click(screen.getByText(invitePrompt));
    expect(screen.getByText("Details of your nominee")).toBeInTheDocument();

    await user.type(
      await screen.findByLabelText("Email"),
      "test@opensystemslab.io"
    );
    await user.type(
      await screen.findByLabelText("Full name"),
      "Mr Nominee{enter}"
    );
    expect(
      await screen.findByText("Enter your name or organisation name")
    ).toBeInTheDocument();
  });

  it("disables the invite link if you already have an in-progress payment", async () => {
    setup(
      <Confirm
        {...inviteProps}
        buttonTitle={"Retry payment"}
        paymentStatus={PaymentStatus.created}
      />
    );

    expect(screen.getByText("How to pay")).toBeInTheDocument();
    expect(screen.getByText("Retry payment")).toBeInTheDocument();
    expect(screen.getByTestId("invite-page-link")).toBeDisabled();
  });

  it("always hides fee banner on the 'InviteToPay' page", async () => {
    const { user } = setup(<Confirm {...inviteProps} />);

    // Land on "Pay" page by default
    expect(screen.getByText("The fee is")).toBeInTheDocument();

    // Switch to "InviteToPay" page
    await user.click(screen.getByText(invitePrompt));
    expect(screen.getByText("Details of your nominee")).toBeInTheDocument();
    expect(screen.queryByText("The fee is")).not.toBeInTheDocument();
  });

  it("hides the fee banner on both pages when 'hideFeeBanner' prop is provided", async () => {
    const { user } = setup(
      <Confirm {...{ ...inviteProps, hideFeeBanner: true }} />
    );

    // Land on "Pay" page by default
    expect(screen.getByText("How to pay")).toBeInTheDocument();
    expect(screen.queryByText("The fee is")).not.toBeInTheDocument();

    // Switch to "InviteToPay" page
    await user.click(screen.getByText(invitePrompt));
    expect(screen.getByText("Details of your nominee")).toBeInTheDocument();
    expect(screen.queryByText("The fee is")).not.toBeInTheDocument();
  });

  it("should not have any accessibility violations", async () => {
    const { container } = setup(<Confirm {...inviteProps} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
