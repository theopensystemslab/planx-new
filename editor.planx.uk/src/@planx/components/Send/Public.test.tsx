import * as axios from "axios";
import React from "react";
import { axe, setup } from "testUtils";

import hasuraEventsResponseMock from "./mocks/hasuraEventsResponseMock";
import { Destination } from "./model";
import SendComponent from "./Public";

jest.spyOn(axios, "default").mockImplementation((url: any) => {
  return {
    value: url()?.startsWith(`${process.env.REACT_APP_API_URL}/send/`)
      ? hasuraEventsResponseMock
      : null,
  } as any;
});

it.todo("renders correctly");

it.todo("sets :localAuthority API param correctly based on team or passport");

// TODO: Turn this test back on when Uniform payload generation is moved to API
it.skip("should not have any accessibility violations", async () => {
  const { container } = setup(
    <SendComponent
      title="Send"
      destinations={[Destination.BOPS, Destination.Uniform]}
    />
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
