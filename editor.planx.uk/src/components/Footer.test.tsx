import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-helper";
import React from "react";

import Footer from "./Footer";

describe("Footer Component", () => {
  let container: HTMLElement;
  beforeEach(() => ({ container } = render(<Footer />)));

  it("should not have any accessibility violations", async () => {
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("should not have the disclaimer component initially visible", () => {
    expect(screen.getByTestId("feedback-disclaimer")).not.toBeVisible();
  });

  it("should display a disclaimer when the Feedback dialog is open", () => {
    userEvent.click(screen.getByText("Feedback"));
    expect(screen.getByTestId("feedback-disclaimer")).toBeVisible();
  });

  it("should remove the discalimer when the Feedback dialog is closed by pressing the button", () => {
    userEvent.click(screen.getByText("Feedback"));
    userEvent.click(screen.getByText("Feedback"));
    expect(screen.getByTestId("feedback-disclaimer")).not.toBeVisible();
  });
});
