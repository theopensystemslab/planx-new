import { PaymentStatus } from "@opensystemslab/planx-core/types";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { act, screen } from "@testing-library/react";
import { logger } from "airbrake";
import { FullStore, Store, useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { setup } from "testUtils";
import { ApplicationPath, Breadcrumbs } from "types";
import { vi } from "vitest";
import { axe } from "vitest-axe";

import Confirm, { Props } from "./Confirm";
import Pay from "./Pay";

// Mock TanStack Router hooks
vi.mock("@tanstack/react-router", async () => {
  const actual = await vi.importActual("@tanstack/react-router");
  return {
    ...actual,
    useRouteContext: vi.fn(() => ({
      isContentPage: false,
    })),
    useNavigate: vi.fn(() => vi.fn()),
    useParams: vi.fn(() => ({
      team: "test-team",
      flow: "test-flow",
    })),
    useLocation: vi.fn(() => ({
      pathname: "/test-team/test-flow/pay",
      search: "",
      hash: "",
      state: {},
    })),
  };
});

vi.mock("lib/featureFlags", () => ({
  hasFeatureFlag: vi.fn().mockResolvedValue(true),
}));

const { getState, setState } = useStore;

let initialState: FullStore;

const resumeButtonText = "Resume an application you have already started";
const saveButtonText = "Save and return to this application later";

const flowWithUndefinedFee: Store.Flow = {
  _root: {
    edges: ["setValue", "pay"],
  },
  pay: {
    type: TYPES.Pay,
    data: {
      fn: "application.fee.payable",
    },
  },
};

const flowWithZeroFee: Store.Flow = {
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

const flowWithNegativeFee: Store.Flow = {
  _root: {
    edges: ["setValue", "pay"],
  },
  setValue: {
    type: TYPES.SetValue,
    edges: ["pay"],
    data: {
      fn: "application.fee.payable",
      val: "-12",
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

const defaultProps = {
  title: "Pay",
  bannerTitle: "The fee is",
  description: "The fee covers the cost of processing your form",
  fee: 103,
  instructionsTitle: "How to pay",
  instructionsDescription: "Pay via GOV.UK Pay",
  buttonTitle: "Pay",
  onConfirm: vi.fn(),
  error: undefined,
  showInviteToPay: false,
};

describe("Pay component when fee is undefined or £0", () => {
  beforeAll(() => (initialState = getState()));
  afterEach(() => act(() => setState(initialState)));

  it("Shows an error if fee is undefined", async () => {
    const handleSubmit = vi.fn();

    setState({ flow: flowWithUndefinedFee, breadcrumbs: {} });
    expect(getState().computePassport()).toEqual({
      data: { "application.fee.payable": undefined },
    });

    await setup(
      <Pay
        title="Pay"
        fn="application.fee.payable"
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

  it("Allows the user to view a fee breakdown and continue if the fee is zero", async () => {
    const handleSubmit = vi.fn();

    setState({ flow: flowWithZeroFee, breadcrumbs: breadcrumbs });
    expect(getState().computePassport()).toEqual({
      data: { "application.fee.payable": ["0"] },
    });

    const { getByTestId, user, getByRole } = await setup(
      <Pay
        title="Pay"
        fn="application.fee.payable"
        handleSubmit={handleSubmit}
        govPayMetadata={[]}
      />,
    );

    // Node is not auto-answered
    expect(handleSubmit).not.toHaveBeenCalled();

    // Fee breakdown displayed
    expect(getByTestId("fee-breakdown-table")).toBeVisible();

    // User can continue
    await user.click(getByRole("button", { name: "Continue" }));
    expect(handleSubmit).toHaveBeenCalled();
  });

  it("Displays an error if fee is negative", async () => {
    const handleSubmit = vi.fn();
    const loggerSpy = vi.spyOn(logger, "notify");

    const negativeFeeBreadcrumbs: Breadcrumbs = {
      setValue: {
        auto: true,
        data: {
          "application.fee.payable": ["-12"],
        },
      },
    };

    setState({
      flow: flowWithNegativeFee,
      breadcrumbs: negativeFeeBreadcrumbs,
    });

    expect(getState().computePassport()).toEqual({
      data: { "application.fee.payable": ["-12"] },
    });

    await setup(
      <Pay
        title="Pay"
        fn="application.fee.payable"
        handleSubmit={handleSubmit}
        govPayMetadata={[]}
      />,
    );

    expect(handleSubmit).not.toHaveBeenCalled();
    expect(
      screen.getByText("We are unable to calculate your fee right now"),
    ).toBeInTheDocument();
    expect(screen.queryByText("Continue")).not.toBeInTheDocument();

    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringMatching(/Negative fee calculated/),
    );
  });
});

describe("Confirm component without inviteToPay", () => {
  beforeAll(() => (initialState = getState()));
  afterEach(() => act(() => setState(initialState)));

  it("renders correctly", async () => {
    await setup(<Confirm {...defaultProps} />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Pay");
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "The fee is",
    );
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
      "How to pay",
    );
  });

  it("formats the fee with a currency symbol and two decimal places", async () => {
    await setup(<Confirm {...defaultProps} />);
    expect(screen.getByText("£103.00")).toBeInTheDocument();
  });

  it("correctly adjusts the heading hierarchy when the fee banner is hidden", async () => {
    await setup(<Confirm {...{ ...defaultProps, hideFeeBanner: true }} />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Pay");
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "How to pay",
    );

    expect(screen.queryByText("The fee is")).not.toBeInTheDocument();
  });

  it("displays an error and continue-with-testing button if Pay is not enabled for this team", async () => {
    const handleSubmit = vi.fn();
    const errorMessage =
      "GOV.UK Pay is not enabled for this local authority (testing)";

    const { user } = await setup(
      <Confirm
        {...defaultProps}
        error={errorMessage}
        onConfirm={handleSubmit}
      />,
    );

    expect(screen.getByTestId("error-summary")).toBeInTheDocument();

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Pay");
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "The fee is",
    );
    expect(screen.getByRole("heading", { level: 4 })).toHaveTextContent(
      errorMessage,
    );

    expect(screen.getByText("Continue")).toBeInTheDocument();
    await user.click(screen.getByText("Continue"));
    expect(handleSubmit).toHaveBeenCalled();
  });

  it("displays the Save/Resume option if the application path requires it", async () => {
    act(() =>
      setState({
        path: ApplicationPath.SaveAndReturn,
        saveToEmail: "test@opensystemsla.b.io",
      }),
    );
    await setup(<Confirm {...defaultProps} />);

    expect(screen.getByText(saveButtonText)).toBeInTheDocument();
    expect(screen.queryByText(resumeButtonText)).not.toBeInTheDocument();
  });

  it("hides the Save/Resume option if the application path does not require it", async () => {
    await setup(<Confirm {...defaultProps} />);

    expect(screen.queryByText(saveButtonText)).not.toBeInTheDocument();
    expect(screen.queryByText(resumeButtonText)).not.toBeInTheDocument();
  });

  it("should not have any accessibility violations", async () => {
    const { container } = await setup(<Confirm {...defaultProps} />);
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

  const invitePrompt = "Invite someone else to pay";
  const payPrompt = "I want to pay myself";

  it("switches pages when you click the invite link", async () => {
    const { user } = await setup(<Confirm {...inviteProps} />);

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
    const { user } = await setup(<Confirm {...inviteProps} />);

    // Switch to "InviteToPay" page
    await user.click(screen.getByText(invitePrompt));
    expect(screen.getByText("Details of your nominee")).toBeInTheDocument();

    await user.type(await screen.findByLabelText("Email"), "jess@{enter}");
    expect(
      await screen.findByText(
        /Enter an email address in the correct format, like name@example.com/,
      ),
    ).toBeInTheDocument();
  });

  it("displays an error if do not submit a nominee name", async () => {
    const { user } = await setup(<Confirm {...inviteProps} />);

    // Switch to "InviteToPay" page
    await user.click(screen.getByText(invitePrompt));
    expect(screen.getByText("Details of your nominee")).toBeInTheDocument();

    await user.type(
      await screen.findByLabelText("Email"),
      "test@opensystemslab.io{enter}",
    );
    expect(
      await screen.findByText(/Enter the full name of the person paying/),
    ).toBeInTheDocument();
  });

  it("displays an error if do not submit an applicant display name", async () => {
    const { user } = await setup(<Confirm {...inviteProps} />);

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
      await screen.findByText(/Enter your name or organisation name/),
    ).toBeInTheDocument();
  });

  it("disables the invite link if you already have an in-progress payment", async () => {
    await setup(
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
    const { user } = await setup(<Confirm {...inviteProps} />);

    // Land on "Pay" page by default
    expect(screen.getByText("The fee is")).toBeInTheDocument();

    // Switch to "InviteToPay" page
    await user.click(screen.getByText(invitePrompt));
    expect(screen.getByText("Details of your nominee")).toBeInTheDocument();
    expect(screen.queryByText("The fee is")).not.toBeInTheDocument();
  });

  it("hides the fee banner on both pages when 'hideFeeBanner' prop is provided", async () => {
    const { user } = await setup(
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

  it("displays the Save/Resume option if the application path requires it", async () => {
    act(() =>
      setState({
        path: ApplicationPath.SaveAndReturn,
        saveToEmail: "test@opensystemsla.b.io",
      }),
    );
    await setup(<Confirm {...inviteProps} />);

    expect(screen.getByText(saveButtonText)).toBeInTheDocument();
    expect(screen.queryByText(resumeButtonText)).not.toBeInTheDocument();
  });

  it("hides the Save/Resume option if the application path does not require it", async () => {
    await setup(<Confirm {...inviteProps} />);

    expect(screen.queryByText(saveButtonText)).not.toBeInTheDocument();
    expect(screen.queryByText(resumeButtonText)).not.toBeInTheDocument();
  });

  it("should not have any accessibility violations", async () => {
    const { container } = await setup(<Confirm {...inviteProps} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe("Confirm component in information-only mode", () => {
  beforeAll(() => (initialState = getState()));
  afterEach(() => act(() => setState(initialState)));

  it("renders correctly", async () => {
    const handleSubmit = vi.fn();
    const { user } = await setup(
      <Confirm {...defaultProps} hidePay={true} onConfirm={handleSubmit} />,
    );

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Pay");
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
    const handleSubmit = vi.fn();
    const { user } = await setup(
      <Confirm
        {...defaultProps}
        hidePay={true}
        showInviteToPay={true}
        onConfirm={handleSubmit}
      />,
    );

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Pay");
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "The fee is",
    );
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
      "How to pay",
    );

    expect(screen.getByRole("button")).toHaveTextContent("Continue");
    expect(screen.getByRole("button")).not.toHaveTextContent("Pay");
    expect(screen.getByRole("button")).not.toHaveTextContent(
      "Invite someone else to pay",
    );

    await user.click(screen.getByText("Continue"));
    expect(handleSubmit).toHaveBeenCalled();
  });

  it("should not have any accessibility violations", async () => {
    const handleSubmit = vi.fn();
    const { container } = await setup(
      <Confirm {...defaultProps} hidePay={true} onConfirm={handleSubmit} />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe("the demo user view", () => {
  beforeAll(() => (initialState = getState()));

  beforeEach(() => {
    act(() =>
      setState({
        teamSlug: "demo",
      }),
    );
  });

  afterEach(() => act(() => setState(initialState)));

  it("should render an error when teamSlug is demo", async () => {
    const handleSubmit = vi.fn();
    const { queryByText } = await setup(
      <Pay
        fn="application.fee.payable"
        handleSubmit={handleSubmit}
        govPayMetadata={[]}
        {...defaultProps}
      />,
    );
    const errorHeader = queryByText("GOV.UK Pay is not enabled for demo users");
    const errorGuidance = queryByText(
      "Click continue to skip payment and continue testing.",
    );

    expect(errorGuidance).toBeInTheDocument();
    expect(errorHeader).toBeInTheDocument();
  });
});
