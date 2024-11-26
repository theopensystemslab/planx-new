import { screen } from "@testing-library/react";
import React from "react";
import { setup } from "testUtils";

import { VerifyEmail } from "../VerifyEmail";

describe("when the VerifyEmail component renders", () => {
  it("displays the email address input", () => {
    setup(<VerifyEmail params={{ sessionId: "1" }} />);

    expect(screen.queryByText("Verify your email address")).toBeInTheDocument();
    expect(screen.queryByLabelText("Email address")).toBeInTheDocument();
  });
  it.todo("should not display an error message");
});

describe("when the user submits a correct email address to the verifyEmail component", () => {
  it.todo("displays visual feedback to the user");
  it.todo("downloads the application file");
});

describe("when the user submits an incorrect email address to the verifyEmail component", () => {
  it.todo("displays a suitable error message");
});

describe("when user submits an email address to the verifyEmail component and there is a server-side issue", () => {
  it.todo("displays a suitable error message");
});
