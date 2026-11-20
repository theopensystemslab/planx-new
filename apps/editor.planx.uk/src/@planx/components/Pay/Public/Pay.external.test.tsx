import type { TeamSettings } from "@opensystemslab/planx-core/types";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { act, screen } from "@testing-library/react";
import { AppErrorBoundary } from "components/Error/AppErrorBoundary";
import type { FullStore, Store } from "pages/FlowEditor/lib/store";
import { useStore } from "pages/FlowEditor/lib/store";
import { setup } from "test/utils";
import type { Breadcrumbs } from "types";
import { vi } from "vitest";

import { EXTERNAL_PAY_PASSPORT_KEY } from "../model";
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

  it("allows a user to 'continue' once they've optimistically externally paid", async () => {
    const handleSubmit = vi.fn();
    act(() => setState({ previewEnvironment: "standalone" }));

    const { user } = await setup(
      <AppErrorBoundary>
        <Pay
          title="Pay"
          fn="application.fee.payable"
          handleSubmit={handleSubmit}
          externalPay={true}
          govPayMetadata={[]}
        />
      </AppErrorBoundary>,
    );

    // Fee breakdown table is visible
    expect(
      await screen.findByTestId("fee-breakdown-table"),
    ).toBeInTheDocument();

    expect(await screen.findByText("Continue")).toBeInTheDocument();
    await user.click(await screen.findByText("Continue"));

    // Sets a payment reference on "continue"
    expect(handleSubmit).toHaveBeenCalledWith({
      data: {
        [EXTERNAL_PAY_PASSPORT_KEY]: "External payment",
      },
      auto: false,
    });
  });
});
