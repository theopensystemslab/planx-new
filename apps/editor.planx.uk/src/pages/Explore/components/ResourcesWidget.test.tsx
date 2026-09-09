import { screen } from "@testing-library/react";
import { setup } from "test/utils";

import ResourcesWidget from "./ResourcesWidget";

test("links to each documentation page via the ?guide param", async () => {
  await setup(<ResourcesWidget />);

  const expected = {
    Resources: "resources",
    Onboarding: "onboarding",
    "Guides & tutorials": "tutorials",
  };

  for (const [label, guide] of Object.entries(expected)) {
    const link = screen.getByRole("link", { name: label });
    expect(link).toHaveAttribute(
      "href",
      expect.stringContaining(`guide=${guide}`),
    );
  }
});
