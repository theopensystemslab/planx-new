import { screen, waitFor } from "@testing-library/react";
import { graphql, HttpResponse } from "msw";
import React from "react";
import server from "test/mockServer";
import { setup } from "test/utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  mockPay,
  mockSubmissionEvents,
  mockSubmissionFailureEvents,
  teamData,
} from "../mockSubmissions";
import SubmissionDetailModal from "./SubmissionDetailModal";

const mockGetUserRoleForCurrentTeam = vi.fn();
const mockTeamSlug = "test-council";

vi.mock("pages/FlowEditor/lib/store", () => ({
  useStore: vi.fn((selector) =>
    selector({
      teamSlug: mockTeamSlug,
      getUserRoleForCurrentTeam: mockGetUserRoleForCurrentTeam,
    }),
  ),
}));

const mockNavigate = vi.fn();
vi.mock("@tanstack/react-router", async () => {
  const actual = await vi.importActual("@tanstack/react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ flow: "test-flow" }),
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
  mockGetUserRoleForCurrentTeam.mockReturnValue("teamEditor");
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

  describe("Resubmit button", () => {
    it("does not render resubmit button when user is not platform admin", async () => {
      mockGetUserRoleForCurrentTeam.mockReturnValue("teamEditor");

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
      mockGetUserRoleForCurrentTeam.mockReturnValue("platformAdmin");

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
      mockGetUserRoleForCurrentTeam.mockReturnValue("platformAdmin");

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
      mockGetUserRoleForCurrentTeam.mockReturnValue("platformAdmin");

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
      mockGetUserRoleForCurrentTeam.mockReturnValue("platformAdmin");

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
  });
});
