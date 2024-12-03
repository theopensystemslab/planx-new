import { screen } from "@testing-library/react";
import React from "react";
import { setup } from "testUtils";

import { VerifySubmissionEmail } from "../VerifySubmissionEmail";

describe("when the VerifySubmissionEmail component renders", () => {
  it("displays the email address input", () => {
    setup(<VerifySubmissionEmail params={{ sessionId: "1" }} />);

    expect(
      screen.queryByText("Verify your submission email address"),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("Email address")).toBeInTheDocument();
  });
  it.todo("should not display an error message");
  it.todo(
    "shows sessionId and local authority in the application details table",
  );
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
