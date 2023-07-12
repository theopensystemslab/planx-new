import Button from "@mui/material/Button";
import { act, screen, waitFor } from "@testing-library/react";
import { FullStore, vanillaStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { axe, setup } from "testUtils";
import { ApplicationPath } from "types";

import Card from "./Card";

const { getState, setState } = vanillaStore;

let initialState: FullStore;

describe("Card component", () => {
  const resumeButtonText = "Resume an application you have already started";
  const saveButtonText = "Save and return to this application later";
  const handleSubmit = jest.fn();

  beforeAll(() => (initialState = getState()));

  afterEach(() => waitFor(() => setState(initialState)));

  it("displays the Save/Resume option if the application path requires it", () => {
    act(() => setState({ path: ApplicationPath.SaveAndReturn }));
    const children = <Button>Testing 123</Button>;
    setup(<Card handleSubmit={handleSubmit} children={children}></Card>);

    expect(screen.getByText(resumeButtonText)).toBeInTheDocument();
    act(() => setState({ saveToEmail: "test@test.com" }));
    expect(screen.getByText(saveButtonText)).toBeInTheDocument();
  });

  it("hides the Save/Resume option if the application path does not require it", () => {
    act(() => setState({ path: ApplicationPath.SingleSession }));
    const children = <Button>Testing 123</Button>;
    setup(<Card handleSubmit={handleSubmit} children={children}></Card>);

    expect(screen.queryByText(resumeButtonText)).not.toBeInTheDocument();
    expect(screen.queryByText(saveButtonText)).not.toBeInTheDocument();
  });

  it("hides the Save/Resume option if the card does not have a 'Continue' button", () => {
    act(() => setState({ path: ApplicationPath.SaveAndReturn }));
    const children = <h1>Confirmation Page</h1>;
    setup(<Card children={children}></Card>);

    expect(screen.queryByText(resumeButtonText)).not.toBeInTheDocument();
    expect(screen.queryByText(saveButtonText)).not.toBeInTheDocument();
  });

  it("updates state to navigate to the 'Resume' page if the 'Resume' button is clicked", async () => {
    act(() => setState({ path: ApplicationPath.SaveAndReturn }));
    const children = <Button>Testing 123</Button>;
    const { user } = setup(
      <Card handleSubmit={handleSubmit} children={children}></Card>,
    );

    await user.click(screen.getByText(resumeButtonText));
    expect(getState().path).toEqual(ApplicationPath.Resume);
  });

  it("updates state to navigate to the 'Save' page if the 'Save' button is clicked", async () => {
    act(() => setState({ path: ApplicationPath.SaveAndReturn }));
    act(() => setState({ saveToEmail: "test@test.com" }));
    const children = <Button>Testing 123</Button>;
    const { user } = setup(
      <Card handleSubmit={handleSubmit} children={children}></Card>,
    );

    await user.click(screen.getByText(saveButtonText));
    expect(getState().path).toEqual(ApplicationPath.Save);
  });

  it("should not have any accessibility violations", async () => {
    setState({ path: ApplicationPath.SaveAndReturn });
    const children = <Button>Testing 123</Button>;
    const { container } = setup(
      <Card handleSubmit={handleSubmit} children={children}></Card>,
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
