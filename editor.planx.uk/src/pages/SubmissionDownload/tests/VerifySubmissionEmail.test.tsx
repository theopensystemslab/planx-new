import { screen } from "@testing-library/react";
import React from "react";
import { setup } from "testUtils";
import { axe } from "vitest-axe";

import { VerifySubmissionEmail } from "../VerifySubmissionEmail";

describe("when the VerifySubmissionEmail component renders", () => {
  it("displays the email address input", () => {
    setup(<VerifySubmissionEmail params={{ sessionId: "1" }} />);

    expect(
      screen.getByText("Verify your submission email address"),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Submission email address"),
    ).toBeInTheDocument();
  });

  it("should not display an error message", () => {
    setup(<VerifySubmissionEmail params={{ sessionId: "1" }} />);

    expect(
      screen.queryByText("Sorry, something went wrong. Please try again."),
    ).not.toBeInTheDocument();
  });

  it("should not have any accessibility violations", async () => {
    const { container } = setup(
      <VerifySubmissionEmail params={{ sessionId: "1" }} />,
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("shows sessionId and local authority in the application details table", async () => {
    setup(
      <VerifySubmissionEmail
        params={{ sessionId: "a-session-id", team: "barking-and-dagenham" }}
      />,
    );
    expect(screen.getByText("Session ID")).toBeInTheDocument();
    expect(screen.getByText("a-session-id")).toBeInTheDocument();

    expect(screen.getByText("Local Authority")).toBeInTheDocument();

    expect(screen.getByText("Barking And Dagenham")).toBeInTheDocument(); // with correct casing
  });
});

describe("when the user submits a correct email address", () => {
  it.todo("displays visual feedback to the user");
  it.todo("downloads the application file");
});

describe("when the user submits an incorrect email address", () => {
  it.todo("displays a suitable error message");
});

describe("when user submits an email address and there is a server-side issue", () => {
  it.todo("displays a suitable error message");
});
