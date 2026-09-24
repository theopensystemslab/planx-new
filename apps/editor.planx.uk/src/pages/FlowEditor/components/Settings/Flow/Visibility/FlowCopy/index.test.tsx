import { screen } from "@testing-library/react";
import { graphql, HttpResponse } from "msw";
import server from "test/mockServer";
import { setup } from "test/utils";

import FlowCopySettings from ".";

const mockFlowVisibility = (isTrial: boolean) =>
  graphql.query("GetFlowVisibility", () =>
    HttpResponse.json({
      data: {
        flows: [
          {
            id: "123",
            canCreateFromCopy: false,
            team: { settings: { isTrial } },
          },
        ],
      },
    }),
  );

describe("FlowCopySettings", () => {
  it("disables copy permissions for trial accounts", async () => {
    server.use(mockFlowVisibility(true));
    await setup(<FlowCopySettings isService={true} />);

    expect(
      await screen.findByText(
        "Trial accounts cannot set flow copy permissions.",
      ),
    ).toBeVisible();
    expect(screen.getByRole("switch")).toBeDisabled();
  });

  it("enables copy permissions for non-trial accounts", async () => {
    server.use(mockFlowVisibility(false));
    await setup(<FlowCopySettings isService={true} />);

    expect(await screen.findByRole("switch")).toBeEnabled();
    expect(
      screen.queryByText("Trial accounts cannot set flow copy permissions."),
    ).not.toBeInTheDocument();
  });
});
