import { useMatches } from "@tanstack/react-router";
import { screen } from "@testing-library/react";
import { useStore } from "pages/FlowEditor/lib/store";
import { setup } from "test/utils";

import ApplicationViewer from "./ApplicationViewer";

vi.mock("@tanstack/react-router", async () => ({
  ...(await vi.importActual("@tanstack/react-router")),
  useMatches: vi.fn(),
}));

const mockRoute = (routeId: string) =>
  vi
    .mocked(useMatches)
    .mockReturnValue([{ routeId }] as ReturnType<typeof useMatches>);

describe("ApplicationViewer fee breakdown", () => {
  beforeEach(() => {
    useStore.setState({
      breadcrumbs: { question: { auto: false } },
      govUkPayment: undefined,
    });
  });

  it.each([
    "/_public/_planXDomain/$team/$flow/pay/view-application",
    "/_public/_customDomain/$flow/pay/view-application",
  ])("is shown on %s, after an invite to pay", async (routeId) => {
    mockRoute(routeId);
    await setup(<ApplicationViewer />);

    expect(
      await screen.findByRole("heading", { name: "Fee breakdown" }),
    ).toBeVisible();
  });

  it("is not shown on an unpaid view application page", async () => {
    mockRoute("/_public/_planXDomain/$team/$flow/published/view-application");
    await setup(<ApplicationViewer />);

    expect(
      await screen.findByRole("heading", { name: "Your responses" }),
    ).toBeVisible();
    expect(
      screen.queryByRole("heading", { name: "Fee breakdown" }),
    ).not.toBeInTheDocument();
  });
});
