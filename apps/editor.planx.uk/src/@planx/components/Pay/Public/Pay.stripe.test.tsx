import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { act, screen, waitFor } from "@testing-library/react";
import { AppErrorBoundary } from "components/Error/AppErrorBoundary";
import type { FullStore, Store } from "pages/FlowEditor/lib/store";
import { useStore } from "pages/FlowEditor/lib/store";
import { setup } from "test/utils";
import type { Breadcrumbs } from "types";
import { vi } from "vitest";

import Pay from "./Pay";

vi.mock("lib/featureFlags", () => ({
  hasFeatureFlag: (flag: string) => flag === "STRIPE_MIGRATION",
}));

vi.mock("@tanstack/react-router", async () => {
  const actual = await vi.importActual("@tanstack/react-router");
  return {
    ...actual,
    useRouteContext: vi.fn(() => ({ isContentPage: false })),
    useNavigate: vi.fn(() => vi.fn()),
    useParams: vi.fn(() => ({ team: "test-team", flow: "test-flow" })),
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

const flowWithFee: Store.Flow = {
  _root: { edges: ["setValue", "pay"] },
  setValue: {
    type: TYPES.SetValue,
    edges: ["pay"],
    data: { fn: "application.fee.payable", val: "103" },
  },
  pay: {
    type: TYPES.Pay,
    data: { fn: "application.fee.payable" },
  },
};

const feeBreadcrumbs: Breadcrumbs = {
  setValue: {
    auto: true,
    data: { "application.fee.payable": ["103"] },
  },
};

describe("Pay component with Stripe provider (feature flag on)", () => {
  beforeAll(() => (initialState = getState()));

  afterEach(() => {
    vi.clearAllMocks();
    act(() => setState(initialState));
  });

  it("auto-succeeds in Editor preview mode (side panel)", async () => {
    const handleSubmit = vi.fn();

    act(() =>
      setState({
        flow: flowWithFee,
        breadcrumbs: feeBreadcrumbs,
        previewEnvironment: "editor",
      }),
    );

    const { user } = await setup(
      <AppErrorBoundary>
        <Pay
          title="Pay"
          fn="application.fee.payable"
          handleSubmit={handleSubmit}
          govPayMetadata={[]}
        />
      </AppErrorBoundary>,
    );

    await user.click(await screen.findByText("Pay now"));

    await waitFor(() => expect(handleSubmit).toHaveBeenCalled());
    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { "application.fee.reference": "todo-stripe-data" },
      }),
    );
  });

  it("shows 'Pay now' in standalone (Public) mode", async () => {
    const handleSubmit = vi.fn();
    const consoleSpy = vi.spyOn(console, "log");

    act(() =>
      setState({
        flow: flowWithFee,
        breadcrumbs: feeBreadcrumbs,
        previewEnvironment: "standalone",
      }),
    );

    const { user } = await setup(
      <AppErrorBoundary>
        <Pay
          title="Pay"
          fn="application.fee.payable"
          handleSubmit={handleSubmit}
          govPayMetadata={[]}
        />
      </AppErrorBoundary>,
    );

    expect(await screen.findByText("Pay now")).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();

    await user.click(screen.getByText("Pay now"));

    expect(consoleSpy).toHaveBeenCalledWith("Started new Stripe payment");
  });

  it("auto-succeeds in standalone (Public) when hidePay is true", async () => {
    const handleSubmit = vi.fn();

    act(() =>
      setState({
        flow: flowWithFee,
        breadcrumbs: feeBreadcrumbs,
        previewEnvironment: "standalone",
      }),
    );

    const { user } = await setup(
      <AppErrorBoundary>
        <Pay
          title="Pay"
          fn="application.fee.payable"
          handleSubmit={handleSubmit}
          hidePay={true}
          govPayMetadata={[]}
        />
      </AppErrorBoundary>,
    );

    await user.click(await screen.findByText("Continue"));

    await waitFor(() => expect(handleSubmit).toHaveBeenCalled());
  });

  it("has no existing payment (always shows fresh payment flow)", async () => {
    const handleSubmit = vi.fn();

    act(() =>
      setState({
        flow: flowWithFee,
        breadcrumbs: feeBreadcrumbs,
      }),
    );

    await setup(
      <AppErrorBoundary>
        <Pay
          title="Pay"
          fn="application.fee.payable"
          handleSubmit={handleSubmit}
          govPayMetadata={[]}
        />
      </AppErrorBoundary>,
    );

    expect(await screen.findByText("Pay now")).toBeInTheDocument();
    expect(screen.queryByText("Retry payment")).not.toBeInTheDocument();
  });
});
