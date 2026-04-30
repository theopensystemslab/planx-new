import * as TanStackRouter from "@tanstack/react-router";
import { screen } from "@testing-library/react";
import React from "react";
import { setup } from "testUtils";
import { vi } from "vitest";

import Breadcrumbs from "./Breadcrumbs";

vi.mock("ui/shared/CustomLink/CustomLink", () => ({
  CustomLink: ({
    children,
    ...props
  }: {
    children?: React.ReactNode;
  } & React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a {...props}>{children}</a>
  ),
}));

vi.mock("@tanstack/react-router", async () => {
  const actual = await vi.importActual("@tanstack/react-router");
  return {
    ...actual,
    useParams: vi.fn(() => ({})),
  };
});

vi.mock("pages/FlowEditor/lib/store", async () => ({
  useStore: vi.fn((selector) =>
    selector({
      getTeam: () => ({ slug: "team-name" }),
      previewEnvironment: "editor",
      flowSlug: "test-flow",
      flowStatus: "online",
      canUserEditTeam: vi.fn(() => false),
    }),
  ),
}));

const mockUseParams = vi.mocked(TanStackRouter.useParams);

describe("Breadcrumbs", () => {
  it("renders nothing when not on a flow route", async () => {
    mockUseParams.mockReturnValue({});
    await setup(<Breadcrumbs />);
    expect(screen.queryByText("team-name")).not.toBeInTheDocument();
    expect(screen.queryByText("test-flow")).not.toBeInTheDocument();
  });

  it("displays team name and flow slug", async () => {
    mockUseParams.mockReturnValue({ team: "team-name", flow: "test-flow" });
    await setup(<Breadcrumbs />);
    expect(screen.getByText("team-name")).toBeInTheDocument();
    expect(screen.getByText("test-flow")).toBeInTheDocument();
  });
});
