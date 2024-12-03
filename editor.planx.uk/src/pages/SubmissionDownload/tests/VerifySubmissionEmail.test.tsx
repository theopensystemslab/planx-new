import { screen } from "@testing-library/react";
import React from "react";
import waitForRequest from "test/waitForRequest";
import { setup } from "testUtils";
import { axe } from "vitest-axe";

import { DOWNLOAD_APPLICATION_FILE_URL } from "../queries/useQueryApplicationFileDownload";
import { VerifySubmissionEmail } from "../VerifySubmissionEmail";

const SESSION_ID = "1";

describe("when the VerifySubmissionEmail component renders", () => {
  it("displays the email address input", () => {
    setup(<VerifySubmissionEmail params={{ sessionId: SESSION_ID }} />);
    expect(
      screen.queryByText("Verify your submission email address"),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("Email address")).toBeInTheDocument();
  });

  it("should not display an error message", () => {
    setup(<VerifySubmissionEmail params={{ sessionId: SESSION_ID }} />);
    expect(
      screen.queryByText("Sorry, something went wrong. Please try again."),
    ).not.toBeInTheDocument();
  });
  it("should not have any accessibility violations", async () => {
    const { container } = setup(
      <VerifySubmissionEmail params={{ sessionId: SESSION_ID }} />,
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

const setupWithCorrectEmailInput = async () => {
  const expectedRequestURL = `${DOWNLOAD_APPLICATION_FILE_URL}/${SESSION_ID}?email=planning-officer@council.com&localAuthority=southwark`;
  const downloadFileRequest = waitForRequest("GET", expectedRequestURL);
  const { user } = setup(
    <VerifySubmissionEmail
      params={{ sessionId: SESSION_ID, team: "southwark" }}
    />,
  );
  const emailInput = screen.getByLabelText("Email address");

  await user.type(emailInput, "planning-officer@council.com");
  await user.click(screen.getByTestId("continue-button"));
  return { downloadFileRequest };
};

describe("when the user submits a correct email address", () => {
  it.todo("displays visual feedback to the user");

  // eslint-disable-next-line @vitest/expect-expect
  it("makes a request to the download application endpoint", async () => {
    const { downloadFileRequest } = await setupWithCorrectEmailInput();
    await downloadFileRequest;
  });
});

describe("when the user submits an incorrect email address", () => {
  it.todo("displays a suitable error message");
});

describe("when user submits an email address and there is a server-side issue", () => {
  it.todo("displays a suitable error message");
});
