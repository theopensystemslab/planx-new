import { screen } from "@testing-library/react";
import { graphql, HttpResponse } from "msw";
import server from "test/mockServer";
import { setup } from "test/utils";

import LPSListingSettings from ".";

const mockLPSListing = (isTrial: boolean) =>
  graphql.query("GetLPSListing", () =>
    HttpResponse.json({
      data: {
        flow: {
          id: "123",
          isListedOnLPS: false,
          category: null,
          summary: null,
          team: { settings: { isTrial } },
        },
      },
    }),
  );

describe("LPSListingSettings", () => {
  it("disables LPS listing for trial accounts", async () => {
    server.use(mockLPSListing(true));
    await setup(<LPSListingSettings />);

    expect(
      await screen.findByText("Trial accounts cannot list services on LPS."),
    ).toBeVisible();
    expect(screen.getByRole("switch")).toBeDisabled();
  });

  it("enables LPS listing for non-trial accounts", async () => {
    server.use(mockLPSListing(false));
    await setup(<LPSListingSettings />);

    expect(await screen.findByRole("switch")).toBeEnabled();
    expect(
      screen.queryByText("Trial accounts cannot list services on LPS."),
    ).not.toBeInTheDocument();
  });
});
