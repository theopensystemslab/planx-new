import type { TeamSettings } from "@opensystemslab/planx-core/types";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { act, screen, waitFor } from "@testing-library/react";
import { AppErrorBoundary } from "components/Error/AppErrorBoundary";
import type { FullStore, Store } from "pages/FlowEditor/lib/store";
import { useStore } from "pages/FlowEditor/lib/store";
import { setup } from "test/utils";
import type { Breadcrumbs } from "types";
import { vi } from "vitest";

import Pay from "./Pay";

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
    useSearch: vi.fn(() => ({})),
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

describe("Pay component without a payment provider", () => {
  beforeAll(() => (initialState = getState()));

  beforeEach(() =>
    act(() =>
      setState({
        flow: flowWithFee,
        breadcrumbs: feeBreadcrumbs,
        teamSettings: { paymentProvider: null } as TeamSettings,
      }),
    ),
  );

  afterEach(() => {
    vi.clearAllMocks();
    act(() => setState(initialState));
  });

  it("displays an error when attempting to pay without a provider", async () => {
    const handleSubmit = vi.fn();
    act(() => setState({ previewEnvironment: "standalone" }));

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

    expect(await screen.findByTestId("error-summary")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Online payments are not enabled for this local authority",
      ),
    ).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();

    // Matches GOV.UK Pay - applicant can skip payment and continue
    await user.click(screen.getByText("Continue"));
    expect(handleSubmit).toHaveBeenCalled();
  });

  it("auto-succeeds when hidePay is true, allowing the user to continue", async () => {
    const handleSubmit = vi.fn();
    act(() => setState({ previewEnvironment: "standalone" }));

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
    expect(
      screen.queryByText(
        "Online payments are not enabled for this local authority",
      ),
    ).not.toBeInTheDocument();
  });

  it("auto-succeeds in Editor preview (side panel)", async () => {
    const handleSubmit = vi.fn();
    act(() => setState({ previewEnvironment: "editor" }));

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

    await waitFor(() => expect(handleSubmit).toHaveBeenCalledWith({}));
  });
});
