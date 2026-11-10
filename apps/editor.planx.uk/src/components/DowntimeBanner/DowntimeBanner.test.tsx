import { screen, waitFor, within } from "@testing-library/react";
import { setup } from "test/utils";
import { axe } from "vitest-axe";

import DowntimeBanner, { DEFAULT_TITLE } from "./DowntimeBanner";

describe("DowntimeBanner", () => {
  it("displays default content if no title is provided", async () => {
    await setup(<DowntimeBanner />);

    expect(screen.getByRole("alert")).toHaveTextContent(DEFAULT_TITLE);
  });

  it("displays a custom title", async () => {
    await setup(<DowntimeBanner title="Planned maintenance" />);

    const alert = screen.getByRole("alert");
    expect(within(alert).getByText("Planned maintenance").tagName).toBe(
      "STRONG",
    );
    expect(alert).not.toHaveTextContent(DEFAULT_TITLE);
  });

  it("does not display a 'More information' link without a description", async () => {
    await setup(<DowntimeBanner title="Planned maintenance" />);

    expect(
      screen.queryByRole("button", { name: /More information/ }),
    ).not.toBeInTheDocument();
  });

  it("opens and closes a modal containing the description", async () => {
    const { user } = await setup(
      <DowntimeBanner
        title="Planned maintenance"
        description="<p>Any applications in progress will be <strong>saved</strong>.</p>"
      />,
    );

    await user.click(
      screen.getByRole("button", {
        name: "More information about Planned maintenance",
      }),
    );

    const dialog = await screen.findByRole("dialog", {
      name: "Planned maintenance",
    });
    expect(dialog).toHaveTextContent(
      "Any applications in progress will be saved.",
    );

    await user.click(
      within(dialog).getByRole("button", { name: "Close more information" }),
    );
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  });

  it("does not use live region semantics when previewing", async () => {
    await setup(<DowntimeBanner title="Planned maintenance" isPreview />);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByText("Planned maintenance")).toBeInTheDocument();
  });

  it("should not have any accessibility violations", async () => {
    const { container } = await setup(
      <DowntimeBanner
        title="Planned maintenance"
        description="<p>More detail</p>"
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
