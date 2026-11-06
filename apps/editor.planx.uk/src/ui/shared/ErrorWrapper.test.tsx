import { screen, waitFor } from "@testing-library/react";
import React from "react";
import { setup } from "test/utils";

import ErrorWrapper from "./ErrorWrapper";

const Form: React.FC<{ errors: { a?: string; b?: string } }> = ({ errors }) => (
  <div data-testid="document-start">
    <button>Continue</button>
    <ErrorWrapper id="a" error={errors.a}>
      <input aria-label="Field A" />
    </ErrorWrapper>
    <ErrorWrapper id="b" error={errors.b}>
      <input aria-label="Field B" />
    </ErrorWrapper>
    <ErrorWrapper id="c" error={errors.a ? undefined : "No input"}>
      <p>Static content</p>
    </ErrorWrapper>
  </div>
);

describe("ErrorWrapper focus management", () => {
  it("focuses the first errored input on the page", async () => {
    const { rerender } = await setup(<Form errors={{}} />);
    screen.getByRole("button", { name: "Continue" }).focus();

    rerender(<Form errors={{ a: "Enter A", b: "Enter B" }} />);

    await waitFor(() => expect(screen.getByLabelText("Field A")).toHaveFocus());
  });

  it("focuses the error message when there is no focusable child", async () => {
    // Only wrapper "c" (no focusable children) has an error
    await setup(<Form errors={{}} />);

    await waitFor(() =>
      expect(screen.getByText("Error: No input")).toHaveFocus(),
    );
  });

  it("does not move focus outside of the public interface", async () => {
    await setup(
      <ErrorWrapper error="Required">
        <input aria-label="Field" />
      </ErrorWrapper>,
    );

    await new Promise((r) => setTimeout(r, 0));
    expect(screen.getByLabelText("Field")).not.toHaveFocus();
    expect(screen.getByText("Error: Required")).not.toHaveFocus();
  });
});

describe("ErrorWrapper aria-invalid", () => {
  it("marks wrapped inputs as invalid only whilst an error is present", async () => {
    const { rerender } = await setup(
      <ErrorWrapper error="Required">
        <input aria-label="Field" />
      </ErrorWrapper>,
    );
    expect(screen.getByLabelText("Field")).toHaveAttribute(
      "aria-invalid",
      "true",
    );

    rerender(
      <ErrorWrapper error={undefined}>
        <input aria-label="Field" />
      </ErrorWrapper>,
    );
    await waitFor(() =>
      expect(screen.getByLabelText("Field")).not.toHaveAttribute(
        "aria-invalid",
      ),
    );
  });

  it("marks the radiogroup rather than individual radios", async () => {
    await setup(
      <ErrorWrapper error="Select an option">
        <div role="radiogroup" aria-label="Options">
          <input type="radio" aria-label="Yes" />
        </div>
      </ErrorWrapper>,
    );
    expect(screen.getByRole("radiogroup")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(screen.getByLabelText("Yes")).not.toHaveAttribute("aria-invalid");
  });

  it("does not mark inputs owned by a nested ErrorWrapper", async () => {
    await setup(
      <ErrorWrapper error="Outer error">
        <div>
          <input aria-label="Outer" />
          <ErrorWrapper error={undefined}>
            <input aria-label="Inner" />
          </ErrorWrapper>
        </div>
      </ErrorWrapper>,
    );
    expect(screen.getByLabelText("Outer")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(screen.getByLabelText("Inner")).not.toHaveAttribute("aria-invalid");
  });
});

describe("ErrorWrapper aria-describedby", () => {
  it("adds the error message id whilst preserving existing ids", async () => {
    const { rerender } = await setup(
      <ErrorWrapper id="field" error="Required">
        <input aria-label="Field" aria-describedby="hint-text" />
      </ErrorWrapper>,
    );
    const input = screen.getByLabelText("Field");
    expect(input).toHaveAttribute(
      "aria-describedby",
      "hint-text error-message-field",
    );
    expect(input).toHaveAccessibleDescription(/Error: Required/);

    rerender(
      <ErrorWrapper id="field" error={undefined}>
        <input aria-label="Field" aria-describedby="hint-text" />
      </ErrorWrapper>,
    );
    await waitFor(() =>
      expect(screen.getByLabelText("Field")).toHaveAttribute(
        "aria-describedby",
        "hint-text",
      ),
    );
  });

  it("does not duplicate an id already referenced by the input", async () => {
    await setup(
      <ErrorWrapper id="field" error="Required">
        <input aria-label="Field" aria-describedby="error-message-field" />
      </ErrorWrapper>,
    );
    expect(screen.getByLabelText("Field")).toHaveAttribute(
      "aria-describedby",
      "error-message-field",
    );
  });

  it("generates an id when none is provided", async () => {
    await setup(
      <ErrorWrapper error="Required">
        <input aria-label="Field" />
      </ErrorWrapper>,
    );
    expect(screen.getByLabelText("Field")).toHaveAccessibleDescription(
      "Error: Required",
    );
  });
});
