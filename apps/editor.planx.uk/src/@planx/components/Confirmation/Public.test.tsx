import type * as planxCore from "@opensystemslab/planx-core";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { act, screen, waitFor } from "@testing-library/react";
import type { FullStore } from "pages/FlowEditor/lib/store";
import { useStore } from "pages/FlowEditor/lib/store";
import { setup } from "test/utils";
import { vi } from "vitest";
import { axe } from "vitest-axe";

import ConfirmationComponent from "./Public";

const { getState, setState } = useStore;

let initialState: FullStore;

vi.mock("hooks/usePublicRouteContext", () => ({
  usePublicRouteContext: vi.fn(() => "/$flow"),
}));

it("should not have any accessibility violations", async () => {
  const { container } = await setup(
    <ConfirmationComponent
      heading="heading"
      description="description"
      nextSteps={[
        { title: "title1", description: "description1" },
        { title: "title2", description: "description2" },
        { title: "title3", description: "description3" },
      ]}
      moreInfo="more info"
      contactInfo="contact info"
    />,
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

describe("Confirmation component", () => {
  const handleSubmit = vi.fn();

  beforeAll(() => (initialState = getState()));

  afterEach(() => waitFor(() => setState(initialState)));

  it("hides the 'Continue' button if it's the final card in the flow", async () => {
    act(() =>
      setState({
        flow: {
          _root: { edges: ["Send", "Confirmation"] },
          Send: { type: TYPES.Send },
          Confirmation: { type: TYPES.Confirmation },
        },
        breadcrumbs: { Send: { auto: false } },
      }),
    );

    expect(getState().upcomingCardIds()).toEqual(["Confirmation"]);
    expect(getState().isFinalCard()).toEqual(true);

    const { user } = await setup(
      <ConfirmationComponent
        heading="heading"
        description="description"
        nextSteps={[
          { title: "title1", description: "description1" },
          { title: "title2", description: "description2" },
          { title: "title3", description: "description3" },
        ]}
        moreInfo="more info"
        contactInfo="contact info"
        handleSubmit={handleSubmit}
      />,
    );

    expect(screen.queryByText("Continue")).not.toBeInTheDocument();
  });

  it("shows the 'Continue' button if there are nodes following it", async () => {
    act(() =>
      setState({
        flow: {
          _root: { edges: ["Send", "Confirmation", "Feedback", "Content"] },
          Send: { type: TYPES.Send },
          Confirmation: { type: TYPES.Confirmation },
          Feedback: { type: TYPES.Feedback },
          Content: { type: TYPES.Content },
        },
        breadcrumbs: { Send: { auto: false } },
      }),
    );

    expect(getState().upcomingCardIds()).toEqual([
      "Confirmation",
      "Feedback",
      "Content",
    ]);
    expect(getState().isFinalCard()).toEqual(false);

    const { user } = await setup(
      <ConfirmationComponent
        heading="heading"
        description="description"
        nextSteps={[
          { title: "title1", description: "description1" },
          { title: "title2", description: "description2" },
          { title: "title3", description: "description3" },
        ]}
        moreInfo="more info"
        contactInfo="contact info"
        handleSubmit={handleSubmit}
      />,
    );

    expect(screen.queryByText("Continue")).toBeInTheDocument();
  });

  it("shows the Stripe payment reference from the passport", async () => {
    act(() =>
      setState({
        flow: {
          _root: { edges: ["Pay", "Send", "Confirmation"] },
          Pay: { type: TYPES.Pay },
          Send: { type: TYPES.Send },
          Confirmation: { type: TYPES.Confirmation },
        },
        breadcrumbs: {
          Pay: {
            auto: false,
            data: { "application.fee.reference.stripe": "pi_test_123" },
          },
          Send: { auto: false },
        },
      }),
    );

    await setup(
      <ConfirmationComponent
        heading="heading"
        description="description"
        nextSteps={[]}
        moreInfo="more info"
        contactInfo="contact info"
      />,
    );

    expect(screen.getByText("Payment reference")).toBeInTheDocument();
    expect(screen.getByText("pi_test_123")).toBeInTheDocument();
  });

  describe("Direct Debit notice", () => {
    const flowWithPay = {
      _root: { edges: ["Pay", "Send", "Confirmation"] },
      Pay: { type: TYPES.Pay },
      Send: { type: TYPES.Send },
      Confirmation: { type: TYPES.Confirmation },
    };

    const defaultDescription =
      "<p>A payment receipt has been emailed to you.</p>";

    it("tells the applicant the payment is processing when the bank takes it later", async () => {
      act(() =>
        setState({
          flow: flowWithPay,
          breadcrumbs: {
            Pay: {
              auto: false,
              data: {
                "application.fee.reference.stripe": "pi_test_123",
                _paymentProcessing: true,
              },
            },
            Send: { auto: false },
          },
        }),
      );

      await setup(
        <ConfirmationComponent
          heading="heading"
          description={defaultDescription}
          nextSteps={[]}
        />,
      );

      expect(
        screen.getByText(/Your Direct Debit is set up/),
      ).toBeInTheDocument();

      // Council content is unchanged
      expect(
        screen.getByText("A payment receipt has been emailed to you."),
      ).toBeInTheDocument();
    });

    it("does not show the notice for a paid payment", async () => {
      act(() =>
        setState({
          flow: flowWithPay,
          breadcrumbs: {
            Pay: {
              auto: false,
              data: { "application.fee.reference.stripe": "pi_test_123" },
            },
            Send: { auto: false },
          },
        }),
      );

      await setup(
        <ConfirmationComponent
          heading="heading"
          description={defaultDescription}
          nextSteps={[]}
        />,
      );

      expect(
        screen.queryByText(/Your Direct Debit is set up/),
      ).not.toBeInTheDocument();
    });
  });
});
