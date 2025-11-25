import type { User } from "@opensystemslab/planx-core/types";
import { act, screen } from "@testing-library/react";
import { graphql, HttpResponse } from "msw";
import { FullStore, useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import server from "test/mockServer";
import { setup } from "testUtils";
import { it } from "vitest";
import { axe } from "vitest-axe";

import About from ".";

const { getState, setState } = useStore;

let initialState: FullStore;

const platformAdminUser: User & { jwt: string } = {
  id: 1,
  firstName: "Editor",
  lastName: "Test",
  isPlatformAdmin: true,
  email: "test@test.com",
  teams: [],
  isAnalyst: false,
  jwt: "x.y.z",
};

// 122 characters
const longInput =
  "A wonderful serenity has taken possession of my entire soul, like these sweet mornings of spring which I enjoy with my who";

const handlers = [
  graphql.query("GetAboutFlow", () =>
    HttpResponse.json({
      data: {
        flow: {
          id: "123",
          summary: null,
          description: "This flow description is in the db already",
          limitations: null,
        },
      },
    }),
  ),
  graphql.mutation("UpdateFlow", () => {
    return HttpResponse.json({
      data: {
        flow: {
          id: "123",
          summary: "A summary.",
          description: null,
          limitations: null,
        },
      },
    });
  }),
];

describe("About flow page", () => {
  beforeAll(() => (initialState = getState()));

  beforeEach(() => {
    getState().setUser(platformAdminUser);
    server.use(...handlers);
  });

  afterEach(() => {
    act(() => setState(initialState));
  });

  it("renders and submits data without an error", async () => {
    const { user } = setup(<About />);
    const serviceSummaryInput = await screen.findByPlaceholderText("Summary");
    expect(screen.getAllByRole("button", { name: "Save" })[0]).toBeDisabled();

    expect(screen.getByText("You have 120 characters remaining")).toBeVisible();
    await user.type(serviceSummaryInput, "A summary.");
    expect(
      await screen.findByText("You have 110 characters remaining"),
    ).toBeVisible();

    expect(screen.getAllByRole("button", { name: "Save" })[0]).toBeEnabled();

    await user.click(screen.getAllByRole("button", { name: "Save" })[0]);

    expect(
      await screen.findByText("Settings updated successfully"),
    ).toBeInTheDocument();
  });

  it("displays an error if the service summary is longer than 120 characters", async () => {
    const { user } = setup(<About />);

    const serviceSummaryInput = await screen.findByPlaceholderText("Summary");

    await user.type(serviceSummaryInput, longInput);

    expect(
      await screen.findByText("You have 2 characters too many"),
    ).toBeInTheDocument();

    await user.click(screen.getAllByRole("button", { name: "Save" })[0]);

    expect(
      screen.getByText(/Service summary must be 120 characters or less/),
    ).toBeInTheDocument();

    await user.click(
      screen.getAllByRole("button", { name: "Reset changes" })[0],
    );
  });

  it("displays data in the fields if there is already flow information in the database", async () => {
    setup(<About />);

    expect(
      await screen.findByText("This flow description is in the db already"),
    ).toBeInTheDocument();
  });

  it("displays an error toast if there is a server-side issue", async () => {
    server.use(
      graphql.mutation("UpdateFlow", () => {
        return HttpResponse.json({
          errors: [
            {
              message: "Database connection failed",
            },
          ],
        });
      }),
    );

    const { user } = setup(<About />);
    const serviceSummaryInput = await screen.findByPlaceholderText("Summary");

    await user.type(serviceSummaryInput, "A summary.");
    await user.click(screen.getAllByRole("button", { name: "Save" })[0]);

    expect(
      await screen.findByText("Failed to update settings"),
    ).toBeInTheDocument();
  });

  it("should not have any accessibility violations", async () => {
    const { container } = setup(<About />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("is not editable if the user has the teamViewer role", async () => {
    const teamViewerUser = { ...platformAdminUser, isPlatformAdmin: false };
    getState().setUser(teamViewerUser);

    getState().setTeamMembers([{ ...teamViewerUser, role: "teamViewer" }]);

    setup(<About />);

    const serviceSummaryInput = await screen.findByPlaceholderText("Summary");

    expect(serviceSummaryInput).toBeDisabled();
    expect(screen.getAllByRole("button", { name: "Save" })[0]).toBeDisabled();
  });
});
