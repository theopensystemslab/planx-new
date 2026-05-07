import { ApolloError } from "@apollo/client";
import { screen } from "@testing-library/react";
import { setup } from "test/utils";

import { PlatformAdminPanel } from "./PlatformAdminPanel";
import { useAdminPanel } from "./useAdminPanel";

vi.mock("./useAdminPanel");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("loading state", () => {
  it("renders a loading indicator while data is being fetched", async () => {
    vi.mocked(useAdminPanel).mockReturnValue({
      loading: true,
      error: undefined,
      data: undefined,
    } as ReturnType<typeof useAdminPanel>);

    await setup(<PlatformAdminPanel />);

    expect(
      await screen.findByTestId("delayed-loading-indicator"),
    ).toBeInTheDocument();
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
  });
});

describe("error state", () => {
  it("renders an error summary when the query fails", async () => {
    vi.mocked(useAdminPanel).mockReturnValue({
      loading: false,
      error: new ApolloError({
        errorMessage: "Failed to fetch admin panel data",
      }),
      data: undefined,
    } as ReturnType<typeof useAdminPanel>);

    await setup(<PlatformAdminPanel />);

    expect(await screen.findByRole("status")).toBeInTheDocument();
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
  });
});
