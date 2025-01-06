import { screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import React from "react";
import { setup } from "testUtils";
import { vi } from "vitest";
import { axe } from "vitest-axe";

import { downloadZipFile } from "../helpers/downloadZip";
import { VerifySubmissionEmail } from "../VerifySubmissionEmail";

vi.mock("./../helpers/downloadZip.tsx");

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
  const mockData = new ArrayBuffer();
  const server = setupServer(
    http.get(
      "http://localhost:7002/download-application-files/a-session-id/?email=submission%40council.com&localAuthority=barking-and-dagenham",
      () => {
        return new HttpResponse(mockData, { status: 200 });
      },
    ),
  );

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it.todo("displays visual feedback to the user");

  it("downloads the application file", async () => {
    const { user } = setup(
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
  it.todo("displays a suitable error message");
});

describe("when user submits an email address and there is a server-side issue", () => {
  it.todo("displays a suitable error message");
});
