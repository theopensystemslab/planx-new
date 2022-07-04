import Button from "@material-ui/core/Button";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-helper";
import { FullStore, vanillaStore } from "pages/FlowEditor/lib/store";
import React from "react";

import SaveAndReturn, { ConfirmEmail } from "./SaveAndReturn";

const { getState, setState } = vanillaStore;

let initialState: FullStore;

describe("Save and Return component", () => {
  const originalHref = window.location.href;

  beforeAll(() => (initialState = getState()));

  afterEach(() => {
    waitFor(() => setState(initialState));
    // Reset URL between tests
    window.history.replaceState({}, "", decodeURIComponent(originalHref));
  });

  it("displays the ConfirmEmail component if an email address is not captured", () => {
    const children = <Button>Testing 123</Button>;
    render(<SaveAndReturn children={children}></SaveAndReturn>);

    expect(screen.queryByText("Testing 123")).not.toBeInTheDocument();
    expect(screen.queryByText("Enter your email address")).toBeInTheDocument();
  });

  it("displays children if an email address is already captured", () => {
    act(() => setState({ saveToEmail: "test@test.com" }));
    const children = <Button>Testing 123</Button>;
    render(<SaveAndReturn children={children}></SaveAndReturn>);

    expect(screen.queryByText("Testing 123")).toBeInTheDocument();

    expect(
      screen.queryByText("Enter your email address")
    ).not.toBeInTheDocument();
  });

  it("will save matching emails to state", async () => {
    const children = <Button>Testing 123</Button>;
    render(<SaveAndReturn children={children}></SaveAndReturn>);

    expect(getState().saveToEmail).toBeUndefined();

    userEvent.type(screen.getByLabelText("Email Address"), "test@test.com");
    userEvent.type(
      screen.getByLabelText("Confirm Email Address"),
      "test@test.com"
    );
    userEvent.click(screen.getByTestId("continue-button"));

    await waitFor(() => {
      expect(getState().saveToEmail).toEqual("test@test.com");
    });
    await waitFor(() => {
      expect(screen.queryByText("Testing 123")).toBeInTheDocument();
    });
  });

  it("should not have any accessibility violations", async () => {
    const children = <Button>Testing 123</Button>;
    const { container } = render(
      <SaveAndReturn children={children}></SaveAndReturn>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("stores the sessionId as part of the URL once an email has been submitted", async () => {
    const children = <Button>Testing 123</Button>;
    render(<SaveAndReturn children={children}></SaveAndReturn>);

    const sessionId = getState().sessionId;
    await waitFor(() => {
      expect(sessionId).toBeDefined();
    });

    userEvent.type(screen.getByLabelText("Email Address"), "test@test.com");
    userEvent.type(
      screen.getByLabelText("Confirm Email Address"),
      "test@test.com"
    );

    expect(window.location.href).not.toContain("sessionId");
    expect(window.location.href).not.toContain(sessionId);

    userEvent.click(screen.getByTestId("continue-button"));

    await waitFor(() => {
      expect(screen.queryByText("Testing 123")).toBeInTheDocument();
    });

    expect(window.location.href).toContain(`sessionId=${sessionId}`);
  });
});

describe("ConfirmEmail component", () => {
  it("will not submit if form fields are empty", async () => {
    const handleSubmit = jest.fn();

    render(<ConfirmEmail handleSubmit={handleSubmit}></ConfirmEmail>);

    userEvent.click(screen.getByTestId("continue-button"));

    expect(handleSubmit).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getAllByText("Email address required")).toHaveLength(2);
    });
    screen
      .getAllByText("Email address required")
      .forEach((el) => expect(el).toBeVisible());
  });

  it("will not submit if form fields do not match", async () => {
    const handleSubmit = jest.fn();

    render(<ConfirmEmail handleSubmit={handleSubmit}></ConfirmEmail>);

    userEvent.type(
      screen.getByLabelText("Email Address"),
      "testABC@testABC.com"
    );
    userEvent.type(
      screen.getByLabelText("Confirm Email Address"),
      "test123@test123.com"
    );
    userEvent.click(screen.getByTestId("continue-button"));

    await waitFor(() => {
      expect(handleSubmit).not.toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText("Emails must match")).toBeVisible();
    });
  });

  it("will display an error for an invalid email address", async () => {
    const handleSubmit = jest.fn();

    render(<ConfirmEmail handleSubmit={handleSubmit}></ConfirmEmail>);

    const emailInput = screen.getByLabelText("Email Address");
    const confirmEmailInput = screen.getByLabelText("Confirm Email Address");

    userEvent.type(emailInput, "not an email");
    userEvent.type(confirmEmailInput, "not an email");
    userEvent.click(screen.getByTestId("continue-button"));

    expect(handleSubmit).not.toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.getAllByText("Invalid email")).toHaveLength(2);
    });
  });

  it("will display an error if a field is left empty", async () => {
    const handleSubmit = jest.fn();

    render(<ConfirmEmail handleSubmit={handleSubmit}></ConfirmEmail>);

    const emailInput = screen.getByLabelText("Email Address");
    const confirmEmailInput = screen.getByLabelText("Confirm Email Address");

    expect(emailInput).toHaveValue("");
    expect(confirmEmailInput).toHaveValue("");

    userEvent.click(screen.getByTestId("continue-button"));

    await waitFor(() => {
      expect(screen.getAllByText("Email address required")).toHaveLength(2);
    });

    await waitFor(() => {
      expect(handleSubmit).not.toHaveBeenCalled();
    });
  });

  it("should not have any accessibility violations upon load", async () => {
    const handleSubmit = jest.fn();

    const { container } = render(
      <ConfirmEmail handleSubmit={handleSubmit}></ConfirmEmail>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("should not have any accessibility violations in the error state", async () => {
    const handleSubmit = jest.fn();

    const { container } = render(
      <ConfirmEmail handleSubmit={handleSubmit}></ConfirmEmail>
    );

    userEvent.click(screen.getByTestId("continue-button"));

    await waitFor(() => {
      expect(screen.getAllByText("Email address required")).toHaveLength(2);
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("submits matching emails", async () => {
    const handleSubmit = jest.fn();

    render(<ConfirmEmail handleSubmit={handleSubmit}></ConfirmEmail>);

    userEvent.type(
      screen.getByLabelText("Email Address"),
      "testABC@testABC.com"
    );
    userEvent.type(
      screen.getByLabelText("Confirm Email Address"),
      "testABC@testABC.com"
    );
    userEvent.click(screen.getByTestId("continue-button"));

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith("testABC@testABC.com");
    });
  });
});
