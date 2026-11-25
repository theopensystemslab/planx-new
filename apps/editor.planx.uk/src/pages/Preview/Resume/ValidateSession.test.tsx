import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { toast } from "react-toastify";
import server from "test/mockServer";
import { setup } from "test/utils";
import { vi } from "vitest";

import ValidateSession from "./ValidateSession";

vi.mock("@tanstack/react-router", async () => {
  const actual = await vi.importActual("@tanstack/react-router");
  return {
    ...actual,
    useMatches: vi.fn(() => [{ routeId: "/_public/_customDomain/$flow" }]),
  };
});

const validateSessionUrl = `${import.meta.env.VITE_APP_API_URL}/validate-session`;

const mockLockedSession = (paymentRequest: unknown) =>
  server.use(
    http.post(validateSessionUrl, () =>
      HttpResponse.json(
        { message: "Session locked", paymentRequest },
        { status: 403 },
      ),
    ),
  );

const renderValidateSession = () =>
  setup(
    <ValidateSession
      sessionId="a6ba8ea4-0f1d-4a6b-8c3e-1e2f0c7b9d10"
      initialEmail="applicant@example.com"
    />,
  );

describe("ValidateSession - locked session", () => {
  beforeEach(() => {
    vi.spyOn(toast, "error");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows payment processing when a delayed payment (e.g. Bacs) has locked the session", async () => {
    mockLockedSession(null);

    await renderValidateSession();

    expect(await screen.findByText("Payment processing")).toBeInTheDocument();
    expect(
      screen.queryByText("Sorry, you can't make changes to this form"),
    ).not.toBeInTheDocument();
    // The session's answers aren't loaded, so there's no application to view
    expect(
      screen.queryByRole("button", { name: "Print form" }),
    ).not.toBeInTheDocument();
  });

  it("explains an invite to pay has locked the session", async () => {
    mockLockedSession({
      id: "payment-request-id",
      payeeName: "Mx Payee",
      payeeEmail: "payee@example.com",
    });

    await renderValidateSession();

    expect(
      await screen.findByText("Sorry, you can't make changes to this form"),
    ).toBeInTheDocument();
    expect(screen.getByText(/you've invited Mx Payee/)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "pay yourself on the payment page" }),
    ).toBeInTheDocument();
  });

  it("does not show an API error toast for a locked session", async () => {
    mockLockedSession(null);

    await renderValidateSession();

    await screen.findByText("Payment processing");
    expect(toast.error).not.toHaveBeenCalled();
  });
});
