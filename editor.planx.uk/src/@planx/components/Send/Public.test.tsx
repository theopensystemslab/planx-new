import { screen } from "@testing-library/react";
import * as axios from "axios";
import React from "react";
import { axe, setup } from "testUtils";

import hasuraEventsResponseMock from "./mocks/hasuraEventsResponseMock";
import { Destination } from "./model";
import SendComponent from "./Public";

jest.spyOn(axios, "default").mockImplementation((url: any) => {
  return {
    data: url()?.startsWith(
      `${process.env.REACT_APP_API_URL}/create-send-events/`
    )
      ? hasuraEventsResponseMock
      : null,
  } as any;
});

it.todo("renders correctly", async () => {
  const { user } = setup(
    <SendComponent
      title="Send"
      destinations={[Destination.BOPS, Destination.Uniform]}
    />
  );
  expect(screen.getByTestId("delayed-loading-indicator")).toBeInTheDocument();
});

it.todo(
  "sets local authority param for API request correctly based on team or passport"
);

it("should not have any accessibility violations", async () => {
  const { container } = setup(
    <SendComponent
      title="Send"
      destinations={[Destination.BOPS, Destination.Uniform]}
    />
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
