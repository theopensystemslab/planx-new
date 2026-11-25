import { screen, waitFor } from "@testing-library/react";
import { subDays } from "date-fns";
import { graphql, http, HttpResponse } from "msw";
import { getUserRoleForTeam } from "pages/FlowEditor/lib/store/user";
import server from "test/mockServer";
import { mockUserWithRole } from "test/mockUser";
import { setup } from "test/utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  mockBacsAwaitingRetryEvents,
  mockPay,
  mockStripePaySuccess,
  mockSubmissionEvents,
  mockSubmissionFailureEvents,
  teamData,
} from "../mockSubmissions";
import type { Submission } from "../types";
import SubmissionDetailModal from "./SubmissionDetailModal";

const mockTeamSlug = "test-council";
let mockUser = mockUserWithRole("teamEditor", mockTeamSlug);

vi.mock("pages/FlowEditor/lib/store", () => ({
  useStore: Object.assign(
    vi.fn((selector) =>
      selector({
        teamSlug: mockTeamSlug,
        user: mockUser,
      }),
    ),
    {
      getState: vi.fn(() => ({ jwt: "mock-jwt-token" })),
    },
  ),
}));

const mockNavigate = vi.fn();
vi.mock("@tanstack/react-router", async () => {
  const actual = await vi.importActual("@tanstack/react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ flow: "test-flow" }),
    // Mirror the $team route's context, which resolves the user's role for the team
    useMatch: ({ select }: { select: (match: unknown) => unknown }) =>
      select({ context: { role: getUserRoleForTeam(mockUser, mockTeamSlug) } }),
  };
});

const handlers = [
  graphql.query("GetSubmissionEvents", () =>
    HttpResponse.json({ data: { submissions: mockSubmissionEvents } }),
  ),
  graphql.query("GetTeamLogo", () => HttpResponse.json({ data: teamData })),
];

beforeEach(() => {
  vi.clearAllMocks();
  server.use(...handlers);
  mockUser = mockUserWithRole("teamEditor", mockTeamSlug);
});

describe("SubmissionDetailModal", () => {
  describe("View submission button", () => {
    it("renders view submission button when submission data is not expired", async () => {
      await setup(
        <SubmissionDetailModal sessionId="6fcb873f-cc7f-4fc0-ad9d-b4148de7a3b5" />,
      );

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /View submission/i }),
        ).toBeInTheDocument();
      });
    });

    it("does not render view button when submission data is expired", async () => {
      const expiredEvents = mockSubmissionEvents.map((event) => ({
        ...event,
        createdAt: "2026-01-01T00:00:00.000000+00:00",
      }));

      server.use(
        graphql.query("GetSubmissionEvents", () =>
          HttpResponse.json({ data: { submissions: expiredEvents } }),
        ),
      );

      await setup(
        <SubmissionDetailModal sessionId="6fcb873f-cc7f-4fc0-ad9d-b4148de7a3b5" />,
      );

      await waitFor(() => {
        expect(screen.queryByText("Submission details")).toBeInTheDocument();
      });

      expect(
        screen.queryByRole("button", { name: /View submission/i }),
      ).not.toBeInTheDocument();
    });

    it("does not render view submission button when all send events are failed", async () => {
      server.use(
        graphql.query("GetSubmissionEvents", () =>
          HttpResponse.json({
            data: { submissions: mockSubmissionFailureEvents },
          }),
        ),
      );

      await setup(
        <SubmissionDetailModal sessionId="6fcb873f-cc7f-4fc0-ad9d-b4148de7a3b5" />,
      );

      await waitFor(() => {
        expect(screen.getByText("Submission details")).toBeInTheDocument();
      });

      expect(
        screen.queryByRole("button", { name: /View submission/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe("Download submission button", () => {
    it("renders download button when submission data is not expired", async () => {
      await setup(
        <SubmissionDetailModal sessionId="6fcb873f-cc7f-4fc0-ad9d-b4148de7a3b5" />,
      );

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /Download/i }),
        ).toBeInTheDocument();
      });
    });

    it("does not render download button when submission data is expired", async () => {
      const expiredEvents = mockSubmissionEvents.map((event) => ({
        ...event,
        createdAt: "2020-01-01T00:00:00.000000+00:00",
      }));

      server.use(
        graphql.query("GetSubmissionEvents", () =>
          HttpResponse.json({ data: { submissions: expiredEvents } }),
        ),
      );

      await setup(
        <SubmissionDetailModal sessionId="6fcb873f-cc7f-4fc0-ad9d-b4148de7a3b5" />,
      );

      await waitFor(() => {
        expect(screen.queryByText("Submission details")).toBeInTheDocument();
      });

      expect(
        screen.queryByRole("button", { name: /Download/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe("View response button", () => {
    it("renders view response button for relevant events", async () => {
      await setup(
        <SubmissionDetailModal sessionId="6fcb873f-cc7f-4fc0-ad9d-b4148de7a3b5" />,
      );

      await waitFor(() => {
        const buttons = screen.getAllByLabelText(/View response/i);
        expect(buttons.length).toBe(6);
      });
    });

    it("opens modal with response data when clicked", async () => {
      const { user } = await setup(
        <SubmissionDetailModal sessionId="6fcb873f-cc7f-4fc0-ad9d-b4148de7a3b5" />,
      );

      await waitFor(() => {
        expect(
          screen.getAllByLabelText(/View response/i)[0],
        ).toBeInTheDocument();
      });

      const viewResponseButton = screen.getAllByLabelText(/View response/i)[0];
      await user.click(viewResponseButton);

      await waitFor(() => {
        expect(screen.getByText(/Response for/i)).toBeInTheDocument();
      });
    });
  });

  describe("Bacs payment awaiting retry", () => {
    const renderWithEvents = async (submissions: Submission[]) => {
      server.use(
        graphql.query("GetSubmissionEvents", () =>
          HttpResponse.json({ data: { submissions } }),
        ),
      );
      await setup(
        <SubmissionDetailModal sessionId="bacs-awaiting-retry-0000-0000-00000000" />,
      );
    };

    it("shows the payment method and the date to retry by", async () => {
      await renderWithEvents(mockBacsAwaitingRetryEvents);

      expect(
        await screen.findByText("Payment failed (Bacs Direct Debit)"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Processing (Bacs Direct Debit)"),
      ).toBeInTheDocument();
      expect(screen.getByText(/Retry by/)).toBeInTheDocument();
    });

    it("does not show a date to retry by once the window has passed", async () => {
      const [failed, ...rest] = mockBacsAwaitingRetryEvents;
      await renderWithEvents([
        { ...failed, payBy: subDays(new Date(), 1).toISOString() },
        ...rest,
      ]);

      expect(
        await screen.findByText("Payment failed (Bacs Direct Debit)"),
      ).toBeInTheDocument();
      expect(screen.queryByText(/Retry by/)).not.toBeInTheDocument();
    });
  });

  describe("Resubmit button", () => {
    it("does not render resubmit button when user is not platform admin", async () => {
      mockUser = mockUserWithRole("teamEditor", mockTeamSlug);

      server.use(
        graphql.query("GetSubmissionEvents", () =>
          HttpResponse.json({
            data: { submissions: mockSubmissionFailureEvents },
          }),
        ),
      );

      await setup(
        <SubmissionDetailModal sessionId="6fcb873f-cc7f-4fc0-ad9d-b4148de7a3b5" />,
      );

      await waitFor(() => {
        expect(screen.queryByText("Submission details")).toBeInTheDocument();
      });

      expect(screen.queryByText(/Resubmit/i)).not.toBeInTheDocument();
    });

    it("does not render resubmit button for successful events", async () => {
      mockUser = mockUserWithRole("platformAdmin", mockTeamSlug);

      const successOnlyEvents = mockSubmissionEvents.filter(
        (event) => event.status === "Success",
      );

      server.use(
        graphql.query("GetSubmissionEvents", () =>
          HttpResponse.json({ data: { submissions: successOnlyEvents } }),
        ),
      );

      await setup(
        <SubmissionDetailModal sessionId="6fcb873f-cc7f-4fc0-ad9d-b4148de7a3b5" />,
      );

      await waitFor(() => {
        expect(screen.queryByText("Submission details")).toBeInTheDocument();
      });

      expect(screen.queryByText(/Resubmit/i)).not.toBeInTheDocument();
    });

    it("does not render resubmit button for Pay events", async () => {
      mockUser = mockUserWithRole("platformAdmin", mockTeamSlug);

      server.use(
        graphql.query("GetSubmissionEvents", () =>
          HttpResponse.json({ data: { submissions: [mockPay] } }),
        ),
      );

      await setup(
        <SubmissionDetailModal sessionId="6fcb873f-cc7f-4fc0-ad9d-b4148de7a3b5" />,
      );

      await waitFor(() => {
        expect(screen.getByText("Pay")).toBeInTheDocument();
      });

      expect(screen.queryByText(/Resubmit/i)).not.toBeInTheDocument();
    });

    it("only renders resubmit button for most recent failed event of each type", async () => {
      mockUser = mockUserWithRole("platformAdmin", mockTeamSlug);

      server.use(
        graphql.query("GetSubmissionEvents", () =>
          HttpResponse.json({ data: { submissions: mockSubmissionEvents } }),
        ),
      );

      await setup(
        <SubmissionDetailModal sessionId="6fcb873f-cc7f-4fc0-ad9d-b4148de7a3b5" />,
      );

      await waitFor(() => {
        expect(screen.queryByText("Submission details")).toBeInTheDocument();
      });

      const resubmitButtons = await screen.findAllByText(/Resubmit/i);
      expect(resubmitButtons.length).toEqual(1); // one resubmit per _type_ of failed event; keep in sync with different types of failures (not succeeded later on) in mocks
    });

    it("shows confirmation dialog when resubmit button is clicked", async () => {
      mockUser = mockUserWithRole("platformAdmin", mockTeamSlug);

      server.use(
        graphql.query("GetSubmissionEvents", () =>
          HttpResponse.json({ data: { submissions: mockSubmissionEvents } }),
        ),
      );

      const { user } = await setup(
        <SubmissionDetailModal sessionId="6fcb873f-cc7f-4fc0-ad9d-b4148de7a3b5" />,
      );

      const resubmitButtons = await screen.findAllByText(/Resubmit/i);
      expect(resubmitButtons.length).toBeGreaterThan(0);

      const resubmitButton = resubmitButtons[0];
      await user.click(resubmitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/You're about to resubmit this application/i),
        ).toBeInTheDocument();
      });
    });

    it("renders when no Send events have succeeded", async () => {
      mockUser = mockUserWithRole("platformAdmin", mockTeamSlug);

      server.use(
        graphql.query("GetSubmissionEvents", () =>
          HttpResponse.json({
            data: { submissions: mockSubmissionFailureEvents },
          }),
        ),
      );

      await setup(
        <SubmissionDetailModal sessionId="6fcb873f-cc7f-4fc0-ad9d-b4148de7a3b5" />,
      );

      await waitFor(() => {
        expect(screen.queryByText("Submission details")).toBeInTheDocument();
      });

      const resubmitButtons = await screen.findAllByText(/Resubmit/i);
      expect(resubmitButtons.length).toEqual(2);
    });
  });

  describe("Payment menu", () => {
    beforeEach(() => {
      server.use(
        graphql.query("GetSubmissionEvents", () =>
          HttpResponse.json({
            data: {
              submissions: [...mockSubmissionEvents, mockStripePaySuccess],
            },
          }),
        ),
      );
    });

    it("renders active download invoice buttons when invoices are active", async () => {
      mockUser = mockUserWithRole("teamEditor", mockTeamSlug);

      server.use(
        http.get(
          `${import.meta.env.VITE_APP_API_URL}/submission/:sessionId/active-invoices`,
          () =>
            HttpResponse.json({
              council_invoice: true,
              payer_invoice: true,
            }),
        ),
      );

      const { user } = await setup(
        <SubmissionDetailModal sessionId="6fcb873f-cc7f-4fc0-ad9d-b4148de7a3b5" />,
      );

      const paymentMenu = await screen.findByTestId("payment-menu-button");
      await user.click(paymentMenu);
      const councilInvoiceButton = await screen.findByText(
        /Download council invoice/i,
      );
      const payerInvoiceButton = await screen.findByText(
        /Download payer invoice/i,
      );

      await waitFor(() => {
        expect(councilInvoiceButton.closest("li")).not.toHaveAttribute(
          "aria-disabled",
          "true",
        );
        expect(payerInvoiceButton.closest("li")).not.toHaveAttribute(
          "aria-disabled",
          "true",
        );
      });
    });

    it("disables download invoice buttons when invoices are not active", async () => {
      mockUser = mockUserWithRole("teamEditor", mockTeamSlug);

      server.use(
        http.get(
          `${import.meta.env.VITE_APP_API_URL}/submission/:sessionId/active-invoices`,
          () =>
            HttpResponse.json({
              council_invoice: false,
              payer_invoice: false,
            }),
        ),
      );

      const { user } = await setup(
        <SubmissionDetailModal sessionId="6fcb873f-cc7f-4fc0-ad9d-b4148de7a3b5" />,
      );

      const paymentMenu = await screen.findByTestId("payment-menu-button");
      await user.click(paymentMenu);
      const councilInvoiceButton = await screen.findByText(
        /Download council invoice/i,
      );
      const payerInvoiceButton = await screen.findByText(
        /Download payer invoice/i,
      );
      await waitFor(() => {
        expect(councilInvoiceButton.closest("li")).toHaveAttribute(
          "aria-disabled",
          "true",
        );
        expect(payerInvoiceButton.closest("li")).toHaveAttribute(
          "aria-disabled",
          "true",
        );
      });
    });
  });
});
