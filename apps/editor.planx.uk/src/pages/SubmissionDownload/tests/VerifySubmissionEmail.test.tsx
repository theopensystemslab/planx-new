import { screen, waitFor } from "@testing-library/react";
import React from "react";
import server from "test/mockServer";
import { setup } from "testUtils";
import { vi } from "vitest";
import { axe } from "vitest-axe";

import { downloadZipFile } from "../helpers/downloadZip";
import { VerifySubmissionEmail } from "../VerifySubmissionEmail";
import {
  getWith403,
  getWithData,
  getWithServerSideError,
  mockData,
} from "./mockDownloadApplicationFile";

vi.mock("../helpers/downloadZip");

describe("when the VerifySubmissionEmail component renders", () => {
  it("displays the email address input", async () => {
    await setup(<VerifySubmissionEmail params={{ sessionId: "1" }} />);

    expect(
      screen.getByText("Verify your submission email address"),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Submission email address"),
    ).toBeInTheDocument();
  });

  it("should not display an error message", async () => {
    await setup(<VerifySubmissionEmail params={{ sessionId: "1" }} />);

    expect(
      screen.queryByText("Sorry, something went wrong. Please try again."),
    ).not.toBeInTheDocument();
  });

  it("should not have any accessibility violations", async () => {
    const { container } = await setup(
      <VerifySubmissionEmail params={{ sessionId: "1" }} />,
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("shows sessionId and local authority in the application details table", async () => {
    await setup(
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
  it("downloads the application file", async () => {
    server.use(getWithData);
    const { user } = await setup(
      <VerifySubmissionEmail
        params={{ sessionId: "a-session-id", team: "barking-and-dagenham" }}
      />,
    );

    const emailInput = screen.getByLabelText("Submission email address");
    await user.type(emailInput, "submission@council.com");
    await user.click(screen.getByRole("button", { name: "Continue" }));

    await waitFor(() =>
      expect(downloadZipFile).toHaveBeenCalledWith(mockData, {
        // the filename should be in the form `${flow}-${sessionId}.zip`
        filename: "undefined-a-session-id.zip", // undefined as we have not mocked a flow
      }),
    );
  });
});

describe("when the user submits an incorrect email address", () => {
  it("displays a suitable error message", async () => {
    server.use(getWith403);
    const { user } = await setup(
      <VerifySubmissionEmail
        params={{ sessionId: "a-session-id", team: "barking-and-dagenham" }}
      />,
    );
    const emailInput = screen.getByLabelText("Submission email address");
    await user.type(emailInput, "wrong_email@council.com");
    await user.click(screen.getByRole("button", { name: "Continue" }));

    await waitFor(() =>
      expect(
        screen.getByText(/Sorry, something went wrong. Please try again/),
      ).toBeInTheDocument(),
    );
  });
});

describe("when user submits a correct email address but there is a server-side issue", () => {
  it("displays a suitable error message", async () => {
    server.use(getWithServerSideError);
    const { user } = await setup(
      <VerifySubmissionEmail
        params={{ sessionId: "a-session-id", team: "barking-and-dagenham" }}
      />,
    );
    const emailInput = screen.getByLabelText("Submission email address");
    await user.type(emailInput, "submission@council.com");
    await user.click(screen.getByRole("button", { name: "Continue" }));

    await waitFor(() =>
      expect(
        screen.getByText(/Sorry, something went wrong. Please try again/),
      ).toBeInTheDocument(),
    );
  });
});
