import { act, screen } from "@testing-library/react";
import React from "react";
import { setup } from "test/utils";
import { axe } from "vitest-axe";

import ProgressiveLoading from "./ProgressiveLoading";

const STAGES = ["Stage one", "Stage two", "Stage three"];

describe("ProgressiveLoading", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("announces all stages at once in a live region", async () => {
    await setup(<ProgressiveLoading stages={STAGES} interval={1000} />);

    const liveRegion = screen.getByRole("status");
    expect(liveRegion).toHaveTextContent(STAGES.join(". "));
    expect(liveRegion).toHaveAttribute("aria-live", "polite");

    // The live region should receive all stages at once
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });

    expect(liveRegion).toHaveTextContent(STAGES.join(". "));
  });

  it("hides the decorative stage list from assistive technology", async () => {
    const { container } = await setup(
      <ProgressiveLoading stages={STAGES} interval={1000} />,
    );

    expect(container.querySelector('[aria-hidden="true"]')).toHaveTextContent(
      "Stage one",
    );
    expect(screen.getByRole("status")).not.toHaveAttribute("aria-hidden");
  });

  it("moves focus to the live region on mount, so it is announced", async () => {
    await setup(<ProgressiveLoading stages={STAGES} interval={1000} />);

    expect(screen.getByRole("status")).toHaveFocus();
  });

  it("does not contain accessibility violations", async () => {
    const { container } = await setup(
      <ProgressiveLoading stages={STAGES} interval={1000} />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
