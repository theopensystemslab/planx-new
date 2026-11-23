import { act, screen } from "@testing-library/react";
import type { FullStore } from "pages/FlowEditor/lib/store";
import { useStore } from "pages/FlowEditor/lib/store";
import { setup } from "test/utils";

import { ConnectAccount } from ".";

const API_URL = import.meta.env.VITE_APP_API_URL;

const { getState, setState } = useStore;
let initialState: FullStore;

const stubLocation = () => {
  const originalLocation = window.location;
  Object.defineProperty(window, "location", {
    value: { ...originalLocation, href: "" },
    writable: true,
    configurable: true,
  });

  return () =>
    Object.defineProperty(window, "location", {
      value: originalLocation,
      writable: true,
      configurable: true,
    });
};

describe("ConnectAccount", () => {
  beforeAll(() => (initialState = getState()));

  beforeEach(() => {
    setState({ teamSlug: "adur-worthing" });
  });

  afterEach(() => {
    act(() => setState(initialState));
  });

  it("connects a new account under the name entered", async () => {
    const restoreLocation = stubLocation();
    const { user } = await setup(<ConnectAccount existingNames={["Adur"]} />);

    await user.type(screen.getByLabelText("Account name"), "  Worthing ");
    await user.click(
      screen.getByRole("button", { name: "Connect Stripe account" }),
    );

    expect(window.location.href).toBe(
      `${API_URL}/stripe/connect/adur-worthing?account=Worthing`,
    );
    expect(screen.getByText("Redirecting to Stripe...")).toBeInTheDocument();
    restoreLocation();
  });

  it("requires a name", async () => {
    const restoreLocation = stubLocation();
    const { user } = await setup(<ConnectAccount existingNames={[]} />);

    await user.click(
      screen.getByRole("button", { name: "Connect Stripe account" }),
    );

    expect(
      screen.getByText(/Enter a name for the account/),
    ).toBeInTheDocument();
    expect(window.location.href).toBe("");
    restoreLocation();
  });

  it("refuses a name already used by another account, ignoring case", async () => {
    const restoreLocation = stubLocation();
    const { user } = await setup(
      <ConnectAccount existingNames={["Adur", "Worthing"]} />,
    );

    await user.type(screen.getByLabelText("Account name"), "worthing");
    await user.click(
      screen.getByRole("button", { name: "Connect Stripe account" }),
    );

    expect(
      screen.getByText(/There's already an account called worthing/),
    ).toBeInTheDocument();
    expect(window.location.href).toBe("");
    restoreLocation();
  });

  it("refuses a name longer than 100 characters", async () => {
    const restoreLocation = stubLocation();
    const { user } = await setup(<ConnectAccount existingNames={[]} />);

    await user.type(screen.getByLabelText("Account name"), "a".repeat(101));
    await user.click(
      screen.getByRole("button", { name: "Connect Stripe account" }),
    );

    expect(
      screen.getByText(/Account name must be 100 characters or fewer/),
    ).toBeInTheDocument();
    expect(window.location.href).toBe("");
    restoreLocation();
  });
});
