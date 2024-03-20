import { PaymentStatus } from "@opensystemslab/planx-core/types";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { screen } from "@testing-library/react";
import { FullStore, Store, vanillaStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { act } from "react-dom/test-utils";
import * as ReactNavi from "react-navi";
import { axe, setup } from "testUtils";
import { ApplicationPath, Breadcrumbs } from "types";

import Confirm, { Props } from "./Confirm";
import Pay from "./Pay";

const { getState, setState } = vanillaStore;

let initialState: FullStore;

jest
  .spyOn(ReactNavi, "useCurrentRoute")
  .mockImplementation(() => ({ data: { mountpath: "mountpath" } }) as any);

const resumeButtonText = "Resume an application you have already started";
const saveButtonText = "Save and return to this application later";

const flowWithUndefinedFee: Store.flow = {
  _root: {
    edges: ["setValue", "pay"],
  },
  setValue: {
    type: TYPES.SetValue,
    edges: ["pay"],
    data: {
      fn: "application.fee.payable",
      val: "0",
    },
  },
  pay: {
    type: TYPES.Pay,
    data: {
      fn: "application.fee.typo",
    },
  },
};

const flowWithZeroFee: Store.flow = {
  _root: {
    edges: ["setValue", "pay"],
  },
  setValue: {
    type: TYPES.SetValue,
    edges: ["pay"],
    data: {
      fn: "application.fee.payable",
      val: "0",
    },
  },
  pay: {
    type: TYPES.Pay,
    data: {
      fn: "application.fee.payable",
    },
  },
};

// Mimic having passed setValue to reach Pay
const breadcrumbs: Breadcrumbs = {
  setValue: {
    auto: true,
    data: {
      "application.fee.payable": ["0"],
    },
  },
};

describe("Pay component when fee is undefined or £0", () => {
  beforeEach(() => {
    getState().resetPreview();
  });

  it("Shows an error if fee is undefined", () => {
    const handleSubmit = jest.fn();

    setState({ flow: flowWithUndefinedFee, breadcrumbs: breadcrumbs });
    expect(getState().computePassport()).toEqual({
      data: { "application.fee.payable": ["0"] },
    });

    setup(
      <Pay
        title="Pay for your application"
        fn="application.fee.typo"
        handleSubmit={handleSubmit}
        govPayMetadata={[]}
      />,
    );

    // handleSubmit has NOT been called (not skipped), Pay shows error instead
    expect(handleSubmit).not.toHaveBeenCalled();
    expect(
      screen.getByText("We are unable to calculate your fee right now"),
    ).toBeInTheDocument();
    expect(screen.queryByText("Continue")).not.toBeInTheDocument();
  });

  it("Skips pay if fee = 0", () => {
    const handleSubmit = jest.fn();

    setState({ flow: flowWithZeroFee, breadcrumbs: breadcrumbs });
    expect(getState().computePassport()).toEqual({
      data: { "application.fee.payable": ["0"] },
    });

    setup(
      <Pay
        title="Pay for your application"
        fn="application.fee.payable"
        handleSubmit={handleSubmit}
        govPayMetadata={[]}
      />,
    );

    // handleSubmit is called to auto-answer Pay (aka "skip" in card sequence)
    expect(handleSubmit).toHaveBeenCalled();
  });
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
  beforeAll(() => (initialState = getState()));
  afterEach(() => act(() => setState(initialState)));

  it("renders correctly", () => {
    setup(<Confirm {...defaultProps} />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Pay for your application",
    );
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "The fee is",
    );
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
      "How to pay",
    );
  });

  it("formats the fee with a currency symbol and two decimal places", () => {
    setup(<Confirm {...defaultProps} />);
    expect(screen.getByText("£103.00")).toBeInTheDocument();
  });

  it("correctly adjusts the heading hierarchy when the fee banner is hidden", async () => {
    setup(<Confirm {...{ ...defaultProps, hideFeeBanner: true }} />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Pay for your application",
    );
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "How to pay",
    );

    expect(screen.queryByText("The fee is")).not.toBeInTheDocument();
  });

  it("displays an error and continue-with-testing button if Pay is not enabled for this team", async () => {
    const handleSubmit = jest.fn();
    const errorMessage =
      "GOV.UK Pay is not enabled for this local authority (testing)";

    const { user } = setup(
      <Confirm
        {...defaultProps}
        error={errorMessage}
        onConfirm={handleSubmit}
      />,
    );

    expect(screen.getByTestId("error-summary")).toBeInTheDocument();

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Pay for your application",
    );
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "The fee is",
    );
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
      errorMessage,
    );

    expect(screen.getByText("Continue")).toBeInTheDocument();
    await user.click(screen.getByText("Continue"));
    expect(handleSubmit).toHaveBeenCalled();
  });

  it("displays the Save/Resume option if the application path requires it", () => {
    act(() =>
      setState({
        path: ApplicationPath.SaveAndReturn,
        saveToEmail: "test@opensystemsla.b.io",
      }),
    );
    setup(<Confirm {...defaultProps} />);

    expect(screen.getByText(saveButtonText)).toBeInTheDocument();
    expect(screen.queryByText(resumeButtonText)).not.toBeInTheDocument();
  });

  it("hides the Save/Resume option if the application path does not require it", () => {
    setup(<Confirm {...defaultProps} />);

    expect(screen.queryByText(saveButtonText)).not.toBeInTheDocument();
    expect(screen.queryByText(resumeButtonText)).not.toBeInTheDocument();
  });

  it("should not have any accessibility violations", async () => {
    const { container } = setup(<Confirm {...defaultProps} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe("Confirm component with inviteToPay", () => {
  beforeAll(() => (initialState = getState()));
  afterEach(() => act(() => setState(initialState)));

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
        "Enter an email address in the correct format, like name@example.com",
      ),
    ).toBeInTheDocument();
  });

  it("displays an error if do not submit a nominee name", async () => {
    const { user } = setup(<Confirm {...inviteProps} />);

    // Switch to "InviteToPay" page
    await user.click(screen.getByText(invitePrompt));
    expect(screen.getByText("Details of your nominee")).toBeInTheDocument();

    await user.type(
      await screen.findByLabelText("Email"),
      "test@opensystemslab.io{enter}",
    );
    expect(
      await screen.findByText("Enter the full name of the person paying"),
    ).toBeInTheDocument();
  });

  it("displays an error if do not submit an applicant display name", async () => {
    const { user } = setup(<Confirm {...inviteProps} />);

    // Switch to "InviteToPay" page
    await user.click(screen.getByText(invitePrompt));
    expect(screen.getByText("Details of your nominee")).toBeInTheDocument();

    await user.type(
      await screen.findByLabelText("Email"),
      "test@opensystemslab.io",
    );
    await user.type(
      await screen.findByLabelText("Full name"),
      "Mr Nominee{enter}",
    );
    expect(
      await screen.findByText("Enter your name or organisation name"),
    ).toBeInTheDocument();
  });

  it("disables the invite link if you already have an in-progress payment", async () => {
    setup(
      <Confirm
        {...inviteProps}
        buttonTitle={"Retry payment"}
        paymentStatus={PaymentStatus.created}
      />,
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
      <Confirm {...{ ...inviteProps, hideFeeBanner: true }} />,
    );

    // Land on "Pay" page by default
    expect(screen.getByText("How to pay")).toBeInTheDocument();
    expect(screen.queryByText("The fee is")).not.toBeInTheDocument();

    // Switch to "InviteToPay" page
    await user.click(screen.getByText(invitePrompt));
    expect(screen.getByText("Details of your nominee")).toBeInTheDocument();
    expect(screen.queryByText("The fee is")).not.toBeInTheDocument();
  });

  it("displays the Save/Resume option if the application path requires it", () => {
    act(() =>
      setState({
        path: ApplicationPath.SaveAndReturn,
        saveToEmail: "test@opensystemsla.b.io",
      }),
    );
    setup(<Confirm {...inviteProps} />);

    expect(screen.getByText(saveButtonText)).toBeInTheDocument();
    expect(screen.queryByText(resumeButtonText)).not.toBeInTheDocument();
  });

  it("hides the Save/Resume option if the application path does not require it", () => {
    setup(<Confirm {...inviteProps} />);

    expect(screen.queryByText(saveButtonText)).not.toBeInTheDocument();
    expect(screen.queryByText(resumeButtonText)).not.toBeInTheDocument();
  });

  it("should not have any accessibility violations", async () => {
    const { container } = setup(<Confirm {...inviteProps} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe("Confirm component in information-only mode", () => {
  beforeAll(() => (initialState = getState()));
  afterEach(() => act(() => setState(initialState)));

  it("renders correctly", async () => {
    const handleSubmit = jest.fn();
    const { user } = setup(
      <Confirm {...defaultProps} hidePay={true} onConfirm={handleSubmit} />,
    );

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Pay for your application",
    );
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "The fee is",
    );
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
      "How to pay",
    );

    expect(screen.getByRole("button")).toHaveTextContent("Continue");
    expect(screen.getByRole("button")).not.toHaveTextContent("Pay");

    await user.click(screen.getByText("Continue"));
    expect(handleSubmit).toHaveBeenCalled();
  });

  it("renders correctly when inviteToPay is also toggled on by an editor", async () => {
    const handleSubmit = jest.fn();
    const { user } = setup(
      <Confirm
        {...defaultProps}
        hidePay={true}
        showInviteToPay={true}
        onConfirm={handleSubmit}
      />,
    );

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Pay for your application",
    );
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "The fee is",
    );
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
      "How to pay",
    );

    expect(screen.getByRole("button")).toHaveTextContent("Continue");
    expect(screen.getByRole("button")).not.toHaveTextContent("Pay");
    expect(screen.getByRole("button")).not.toHaveTextContent(
      "Invite someone else to pay for this application",
    );

    await user.click(screen.getByText("Continue"));
    expect(handleSubmit).toHaveBeenCalled();
  });

  it("should not have any accessibility violations", async () => {
    const handleSubmit = jest.fn();
    const { container } = setup(
      <Confirm {...defaultProps} hidePay={true} onConfirm={handleSubmit} />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
