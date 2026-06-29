import { act, screen, waitFor } from "@testing-library/react";
import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { setup } from "test/utils";
import { it, vi } from "vitest";
import { axe } from "vitest-axe";

import { DebouncedSearchInput } from "../DebouncedSearchInput";

const setupInput = async (value = "") => {
  const onChange = vi.fn();
  const result = await setup(
    <DndProvider backend={HTML5Backend}>
      <DebouncedSearchInput value={value} onChange={onChange} />
    </DndProvider>,
  );
  return { ...result, onChange };
};

describe("DebouncedSearchInput", () => {
  it("renders a search input", async () => {
    await setupInput();
    expect(screen.getByRole("textbox")).toBeVisible();
  });

  it("calls onChange (debounced) with the typed value", async () => {
    const { user, onChange } = await setupInput();
    await user.type(screen.getByRole("textbox"), "apply");
    await waitFor(() => expect(onChange).toHaveBeenLastCalledWith("apply"));
  });

  it("shows the clear button when value is non-empty", async () => {
    await setupInput("apply");
    expect(screen.getByRole("button", { name: "clear search" })).toBeVisible();
  });

  it("does not show the clear button when value is empty", async () => {
    await setupInput("");
    expect(
      screen.queryByRole("button", { name: "clear search" }),
    ).not.toBeInTheDocument();
  });

  it("calls onChange with an empty string when cleared", async () => {
    const { user, onChange } = await setupInput("apply");
    await user.click(screen.getByRole("button", { name: "clear search" }));
    expect(onChange).toHaveBeenCalledWith("");
  });

  it("syncs the input when the value prop changes externally", async () => {
    let setValue!: (v: string) => void;

    const Controlled = () => {
      const [v, setV] = React.useState("apply");
      setValue = setV;
      return (
        <DndProvider backend={HTML5Backend}>
          <DebouncedSearchInput value={v} onChange={vi.fn()} />
        </DndProvider>
      );
    };

    await setup(<Controlled />);
    expect(screen.getByRole("textbox")).toHaveValue("apply");

    act(() => setValue(""));

    await waitFor(() => expect(screen.getByRole("textbox")).toHaveValue(""));
  });

  it("does not contain accessibility violations", async () => {
    const { container } = await setupInput();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
