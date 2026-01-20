import { screen } from "@testing-library/react";
import { http, type HttpHandler, HttpResponse } from "msw";
import React from "react";
import server from "test/mockServer";
import { setup } from "testUtils";

import { taskDefaults } from "../model";
import EnhancedTextInputComponent from ".";

const invalidDescriptionError: HttpHandler = http.post(
  "*/ai/project-description/enhance",
  async () => {
    return HttpResponse.json(
      {
        error: "INVALID_DESCRIPTION",
      },
      { status: 400 },
    );
  },
);

const serviceUnavailableError: HttpHandler = http.post(
  "*/ai/project-description/enhance",
  async () => {
    return HttpResponse.json(
      {
        error: "SERVICE_UNAVAILABLE",
      },
      { status: 400 },
    );
  },
);

describe("error handling", () => {
  it("handles invalid descriptions", async () => {
    server.use(invalidDescriptionError);

    const { user } = setup(
      <EnhancedTextInputComponent
        id="testId"
        title="test"
        task={"projectDescription"}
        {...taskDefaults.projectDescription}
      />,
    );

    await user.type(
      screen.getByRole("textbox", { name: /test/i }),
      "Not a valid description",
    );
    await user.click(screen.getByTestId("continue-button"));

    // Error status displayed to user
    expect(
      await screen.findByRole("heading", {
        level: 2,
        name: /Invalid description/,
      }),
    ).toBeVisible();
    expect(
      await screen.findByText(
        /The description doesn't appear to be related to a planning application/,
      ),
    ).toBeVisible();
  });

  it("handles service errors", async () => {
    server.use(serviceUnavailableError);

    const { user } = setup(
      <EnhancedTextInputComponent
        id="testId"
        title="test"
        task={"projectDescription"}
        {...taskDefaults.projectDescription}
      />,
    );

    await user.type(
      screen.getByRole("textbox", { name: /test/i }),
      "This is a valid description, but there will be a backend error",
    );
    await user.click(screen.getByTestId("continue-button"));

    // Error status displayed to user
    expect(
      await screen.findByRole("heading", {
        level: 2,
        name: /Service unavailable/,
      }),
    ).toBeVisible();
    expect(
      await screen.findByText(
        /We weren't able to generate a description based on your input. We'll use your original project description./,
      ),
    ).toBeVisible();
  });
});
