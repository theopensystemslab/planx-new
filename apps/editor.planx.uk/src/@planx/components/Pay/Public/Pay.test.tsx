import type { GovUKPayment } from "@opensystemslab/planx-core/types";
import { PaymentStatus } from "@opensystemslab/planx-core/types";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { act, screen, waitFor } from "@testing-library/react";
import { logger } from "airbrake";
import ErrorFallback from "components/Error/ErrorFallback";
import { http, HttpResponse } from "msw";
import type { FullStore, Store } from "pages/FlowEditor/lib/store";
import { useStore } from "pages/FlowEditor/lib/store";
import { ErrorBoundary } from "react-error-boundary";
import server from "test/mockServer";
import { setup } from "test/utils";
import type { Breadcrumbs } from "types";
import { ApplicationPath } from "types";
import { vi } from "vitest";
import { axe } from "vitest-axe";

import type { Props } from "./Confirm";
import Confirm from "./Confirm";
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
    useMatches: vi.fn(() => [{ routeId: "_customDomain/$flow" }]),
  };
});

const { getState, setState } = useStore;

let initialState: FullStore;

const resumeButtonText = "Resume a form you have already started";
const saveButtonText = "Save and return to this form later";

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
  instructionsDescription: "Pay online",
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
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Pay
          title="Pay"
          fn="application.fee.payable"
          handleSubmit={handleSubmit}
          govPayMetadata={[]}
        />
      </ErrorBoundary>,
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
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Pay
          title="Pay"
          fn="application.fee.payable"
          handleSubmit={handleSubmit}
          govPayMetadata={[]}
        />
      </ErrorBoundary>,
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
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Pay
          title="Pay"
          fn="application.fee.payable"
          handleSubmit={handleSubmit}
          govPayMetadata={[]}
        />
      </ErrorBoundary>,
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

describe("Pay component when returning from payment provider", () => {
  const flowWithFee: Store.Flow = {
    _root: {
      edges: ["setValue", "pay"],
    },
    setValue: {
      type: TYPES.SetValue,
      edges: ["pay"],
      data: {
        fn: "application.fee.payable",
        val: "103",
      },
    },
    pay: {
      type: TYPES.Pay,
      data: {
        fn: "application.fee.payable",
      },
    },
  };

  const feeBreadcrumbs: Breadcrumbs = {
    setValue: {
      auto: true,
      data: {
        "application.fee.payable": ["103"],
      },
    },
  };

  const inFlightPayment: GovUKPayment = {
    amount: 103,
    reference: "test-reference",
    state: {
      status: PaymentStatus.created,
      finished: false,
    },
    payment_id: "test-payment-id",
    payment_provider: "sandbox",
    created_date: "2024-01-01T00:00:00.000Z",
    _links: {
      self: {
        href: "https://gov.uk/pay/self",
        method: "GET",
      },
      next_url: {
        href: "https://gov.uk/pay/next",
        method: "GET",
      },
      next_url_post: {
        type: "multipart/form-data",
        params: { chargeTokenId: "test-charge-token" },
        href: "https://gov.uk/pay/next",
        method: "POST",
      },
    },
  };

  const getPaymentUrl = `${import.meta.env.VITE_APP_API_URL}/pay/:teamSlug/:paymentId`;

  const setUpPayComponent = (payment: GovUKPayment) => {
    act(() =>
      setState({
        flow: flowWithFee,
        breadcrumbs: feeBreadcrumbs,
        teamSlug: "testTeam",
        govUkPayment: payment,
      }),
    );

    const handleSubmit = vi.fn();

    return { handleSubmit };
  };

  beforeAll(() => (initialState = getState()));

  afterEach(() => {
    vi.clearAllMocks();
    act(() => setState(initialState));
  });

  const successfulPaymentResponse = {
    ...inFlightPayment,
    state: { status: PaymentStatus.success, finished: true },
  };

  it("offers a status check when the payment status request fails", async () => {
    server.use(
      http.get(getPaymentUrl, () =>
        HttpResponse.json({ error: "Something went wrong" }, { status: 500 }),
      ),
    );

    const { handleSubmit } = setUpPayComponent(inFlightPayment);

    await setup(
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Pay
          title="Pay"
          fn="application.fee.payable"
          handleSubmit={handleSubmit}
          govPayMetadata={[]}
        />
      </ErrorBoundary>,
    );

    expect(await screen.findByText("Check payment status")).toBeInTheDocument();
    expect(
      screen.getByText(/We could not check the status of your payment/),
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Loading payment information"),
    ).not.toBeInTheDocument();

    // We do not offer to resume the payment
    expect(screen.queryByText("Retry payment")).not.toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it("recovers when a repeated status check succeeds", async () => {
    let isFirstRequest = true;

    server.use(
      http.get(getPaymentUrl, () => {
        if (isFirstRequest) {
          isFirstRequest = false;
          return HttpResponse.json(
            { error: "Something went wrong" },
            { status: 500 },
          );
        }

        return HttpResponse.json(successfulPaymentResponse);
      }),
    );

    const { handleSubmit } = setUpPayComponent(inFlightPayment);

    const { user } = await setup(
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Pay
          title="Pay"
          fn="application.fee.payable"
          handleSubmit={handleSubmit}
          govPayMetadata={[]}
        />
      </ErrorBoundary>,
    );

    await user.click(await screen.findByText("Check payment status"));

    // The second check reads the successful payment user can continue
    await waitFor(() => expect(handleSubmit).toHaveBeenCalled());
    expect(getState().govUkPayment?.state?.status).toEqual(
      PaymentStatus.success,
    );
  });

  it("offers a status check when the payment is missing a payment_id", async () => {
    const loggerSpy = vi.spyOn(logger, "notify");

    const { handleSubmit } = setUpPayComponent({
      ...inFlightPayment,
      payment_id: "",
    });

    await setup(
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Pay
          title="Pay"
          fn="application.fee.payable"
          handleSubmit={handleSubmit}
          govPayMetadata={[]}
        />
      </ErrorBoundary>,
    );

    expect(await screen.findByText("Check payment status")).toBeInTheDocument();
    expect(
      screen.queryByText("Loading payment information"),
    ).not.toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringMatching(/Missing GOV.UK payment_id/),
    );
  });

  it("allows the user to continue when the payment status request succeeds", async () => {
    server.use(
      http.get(getPaymentUrl, () =>
        HttpResponse.json(successfulPaymentResponse),
      ),
    );

    const { handleSubmit } = setUpPayComponent(inFlightPayment);

    await setup(
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Pay
          title="Pay"
          fn="application.fee.payable"
          handleSubmit={handleSubmit}
          govPayMetadata={[]}
        />
      </ErrorBoundary>,
    );

    await waitFor(() => expect(handleSubmit).toHaveBeenCalled());
    expect(screen.queryByText("Check payment status")).not.toBeInTheDocument();
    expect(screen.queryByText("Retry payment")).not.toBeInTheDocument();
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
      "Online payments are not enabled for this local authority (testing)";

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
    nomineeDescription: "Invite someone else to pay",
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

    await user.click(await screen.findByLabelText("Email"));
    await user.paste("jess@");
    await user.keyboard("{Enter}");
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

    await user.click(await screen.findByLabelText("Email"));
    await user.paste("test@opensystemslab.io");
    await user.keyboard("{Enter}");
    expect(
      await screen.findByText(/Enter the full name of the person paying/),
    ).toBeInTheDocument();
  });

  it("displays an error if do not submit an applicant display name", async () => {
    const { user } = await setup(<Confirm {...inviteProps} />);

    // Switch to "InviteToPay" page
    await user.click(screen.getByText(invitePrompt));
    expect(screen.getByText("Details of your nominee")).toBeInTheDocument();

    await user.click(await screen.findByLabelText("Email"));
    await user.paste("test@opensystemslab.io");
    await user.click(await screen.findByLabelText("Full name"));
    await user.paste("Mr Nominee");
    await user.keyboard("{Enter}");
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

  it("does not crash on unmount when window.scrollTo returns a non-function value", async () => {
    const originalScrollTo = window.scrollTo;
    window.scrollTo = vi.fn(() => "someString" as unknown as void);

    try {
      const { user } = await setup(<Confirm {...inviteProps} />);

      await user.click(screen.getByText(invitePrompt));
      expect(screen.getByText("Details of your nominee")).toBeInTheDocument();

      await user.click(screen.getByText(payPrompt));
      expect(screen.getByText("How to pay")).toBeInTheDocument();
    } finally {
      window.scrollTo = originalScrollTo;
    }
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
