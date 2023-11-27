import Button from "@mui/material/Button";
import { act, screen, waitFor } from "@testing-library/react";
import { FullStore, vanillaStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { axe, setup } from "testUtils";

import SaveAndReturn, { ConfirmEmail } from "./SaveAndReturn";

const { getState, setState } = vanillaStore;

let initialState: FullStore;

describe("Save and Return component", () => {
  const originalHref = window.location.href;

  beforeAll(() => (initialState = getState()));

  afterEach(() => {
    act(() => setState(initialState));
    // Reset URL between tests
    window.history.replaceState({}, "", decodeURIComponent(originalHref));
  });

  it("displays the ConfirmEmail component if an email address is not captured", () => {
    const children = <Button>Testing 123</Button>;
    setup(<SaveAndReturn children={children}></SaveAndReturn>);

    expect(screen.queryByText("Testing 123")).not.toBeInTheDocument();
    expect(screen.getByText("Enter your email address")).toBeInTheDocument();
  });

  it("displays children if an email address is already captured", () => {
    act(() => setState({ saveToEmail: "test@test.com" }));
    const children = <Button>Testing 123</Button>;
    setup(<SaveAndReturn children={children}></SaveAndReturn>);

    expect(screen.getByText("Testing 123")).toBeInTheDocument();

    expect(
      screen.queryByText("Enter your email address"),
    ).not.toBeInTheDocument();
  });

  it("will save matching emails to state", async () => {
    const children = <Button>Testing 123</Button>;
    const { user } = setup(<SaveAndReturn children={children}></SaveAndReturn>);
    expect(getState().saveToEmail).toBeUndefined();

    await user.type(screen.getByLabelText("Email address"), "test@test.com");
    await user.type(
      screen.getByLabelText("Confirm email address"),
      "test@test.com",
    );
    await user.click(screen.getByTestId("continue-button"));

    expect(getState().saveToEmail).toEqual("test@test.com");
    expect(screen.getByText("Testing 123")).toBeInTheDocument();
  });

  it("should not have any accessibility violations", async () => {
    const children = <Button>Testing 123</Button>;
    const { container } = setup(
      <SaveAndReturn children={children}></SaveAndReturn>,
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("does not store the sessionId as part of the URL once an email has been submitted", async () => {
    const children = <Button>Testing 123</Button>;
    const { user } = setup(<SaveAndReturn children={children}></SaveAndReturn>);

    const sessionId = getState().sessionId;
    expect(sessionId).toBeDefined();

    await user.type(screen.getByLabelText("Email address"), "test@test.com");
    await user.type(
      screen.getByLabelText("Confirm email address"),
      "test@test.com",
    );

    expect(window.location.href).not.toContain("sessionId");
    expect(window.location.href).not.toContain(sessionId);

    await user.click(screen.getByTestId("continue-button"));

    await waitFor(() => {
      expect(screen.getByText("Testing 123")).toBeInTheDocument();
    });

    expect(window.location.href).not.toContain(`sessionId=${sessionId}`);
  });
});

describe("ConfirmEmail component", () => {
  it("will not submit if form fields are empty", async () => {
    const handleSubmit = jest.fn();

    const { user } = setup(
      <ConfirmEmail handleSubmit={handleSubmit}></ConfirmEmail>,
    );

    await user.click(screen.getByTestId("continue-button"));

    expect(handleSubmit).not.toHaveBeenCalled();
    expect(await screen.findAllByText("Email address required")).toHaveLength(
      2,
    );

    screen
      .getAllByText("Email address required")
      .forEach((el) => expect(el).toBeVisible());
  });

  it("will not submit if form fields do not match", async () => {
    const handleSubmit = jest.fn();

    const { user } = setup(
      <ConfirmEmail handleSubmit={handleSubmit}></ConfirmEmail>,
    );

    await user.type(
      screen.getByLabelText("Email address"),
      "testABC@testABC.com",
    );
    await user.type(
      screen.getByLabelText("Confirm email address"),
      "test123@test123.com",
    );
    await user.click(screen.getByTestId("continue-button"));

    expect(handleSubmit).not.toHaveBeenCalled();

    expect(await screen.findByText("Emails must match")).toBeVisible();
  });

  it("will display an error for an invalid email address", async () => {
    const handleSubmit = jest.fn();

    const { user } = setup(
      <ConfirmEmail handleSubmit={handleSubmit}></ConfirmEmail>,
    );

    const emailInput = screen.getByLabelText("Email address");
    const confirmEmailInput = screen.getByLabelText("Confirm email address");

    await user.type(emailInput, "not an email");
    await user.type(confirmEmailInput, "not an email");
    await user.click(screen.getByTestId("continue-button"));

    expect(handleSubmit).not.toHaveBeenCalled();

    expect(await screen.findAllByText("Invalid email")).toHaveLength(2);
  });

  it("will display an error if a field is left empty", async () => {
    const handleSubmit = jest.fn();

    const { user } = setup(
      <ConfirmEmail handleSubmit={handleSubmit}></ConfirmEmail>,
    );

    const emailInput = screen.getByLabelText("Email address");
    const confirmEmailInput = screen.getByLabelText("Confirm email address");

    expect(emailInput).toHaveValue("");
    expect(confirmEmailInput).toHaveValue("");

    await user.click(screen.getByTestId("continue-button"));

    expect(handleSubmit).not.toHaveBeenCalled();

    expect(await screen.findAllByText("Email address required")).toHaveLength(
      2,
    );
  });

  it("should not have any accessibility violations upon load", async () => {
    const handleSubmit = jest.fn();

    const { container } = setup(
      <ConfirmEmail handleSubmit={handleSubmit}></ConfirmEmail>,
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("should not have any accessibility violations in the error state", async () => {
    const handleSubmit = jest.fn();
    const { container, user } = setup(
      <ConfirmEmail handleSubmit={handleSubmit}></ConfirmEmail>,
    );

    await user.click(screen.getByTestId("continue-button"));
    expect(await screen.findAllByText("Email address required")).toHaveLength(
      2,
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("submits matching emails", async () => {
    const handleSubmit = jest.fn();

    const { user } = setup(
      <ConfirmEmail handleSubmit={handleSubmit}></ConfirmEmail>,
    );

    await user.type(
      screen.getByLabelText("Email address"),
      "testABC@testABC.com",
    );
    await user.type(
      screen.getByLabelText("Confirm email address"),
      "testABC@testABC.com",
    );
    await user.click(screen.getByTestId("continue-button"));

    expect(handleSubmit).toHaveBeenCalledWith("testABC@testABC.com");
  });
});
