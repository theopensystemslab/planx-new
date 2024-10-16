import axios from "axios";
import React from "react";
import { setup } from "testUtils";
import { vi } from "vitest";
import { axe } from "vitest-axe";

import hasuraEventsResponseMock from "./mocks/hasuraEventsResponseMock";
import { Destination } from "./model";
import SendComponent from "./Public";

vi.mock("axios");
const mockAxios = vi.mocked(axios, true);

mockAxios.post.mockResolvedValue(async (url: string) => {
  return {
    value: url.startsWith(
      `${import.meta.env.VITE_APP_API_URL}/create-send-events/`,
    )
      ? hasuraEventsResponseMock
      : null,
  };
});

it.todo("renders correctly");

it.todo("sets :localAuthority API param correctly based on team or passport");

// TODO: Turn this test back on when Uniform payload generation is moved to API
it("should not have any accessibility violations", async () => {
  const { container } = setup(
    <SendComponent
      title="Send"
      destinations={[Destination.BOPS, Destination.Uniform]}
    />,
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
