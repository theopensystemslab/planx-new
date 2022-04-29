import Button from "@material-ui/core/Button";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-helper";
import { FullStore, vanillaStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { ApplicationPath } from "types";

import Card from "./Card";

const { getState, setState } = vanillaStore;

let initialState: FullStore;

describe("Card component", () => {
  const resumeButtonText = "Resume an application you have already started";
  const saveButtonText = "Save and return to this application later";

  beforeAll(() => (initialState = getState()));

  afterEach(() => waitFor(() => setState(initialState)));

  it("displays the Save/Resume option if the application path requires it", () => {
    act(() => setState({ path: ApplicationPath.SaveAndReturn }));
    const children = <Button>Testing 123</Button>;
    render(<Card children={children}></Card>);

    expect(screen.queryByText(resumeButtonText)).toBeInTheDocument();
    act(() => setState({ saveToEmail: "test@test.com" }));
    expect(screen.queryByText(saveButtonText)).toBeInTheDocument();
  });

  it("hides the Save/Resume option if the application path does not require it", () => {
    act(() => setState({ path: ApplicationPath.SingleSession }));
    const children = <Button>Testing 123</Button>;
    render(<Card children={children}></Card>);

    expect(screen.queryByText(resumeButtonText)).not.toBeInTheDocument();
    expect(screen.queryByText(saveButtonText)).not.toBeInTheDocument();
  });

  it("updates state to navigate to the 'Resume' page if the 'Resume' button is clicked", () => {
    act(() => setState({ path: ApplicationPath.SaveAndReturn }));
    const children = <Button>Testing 123</Button>;
    render(<Card children={children}></Card>);

    userEvent.click(screen.getByText(resumeButtonText));
    expect(getState().path).toEqual(ApplicationPath.Resume);
  });

  it("updates state to navigate to the 'Save' page if the 'Save' button is clicked", () => {
    act(() => setState({ path: ApplicationPath.SaveAndReturn }));
    act(() => setState({ saveToEmail: "test@test.com" }));
    const children = <Button>Testing 123</Button>;
    render(<Card children={children}></Card>);

    userEvent.click(screen.getByText(saveButtonText));
    expect(getState().path).toEqual(ApplicationPath.Save);
  });

  it("should not have any accessibility violations", async () => {
    setState({ path: ApplicationPath.SaveAndReturn });
    const children = <Button>Testing 123</Button>;
    const { container } = render(<Card children={children}></Card>);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
