import * as axios from "axios";
import React from "react";
import * as ReactNavi from "react-navi";
import { axe, setup } from "testUtils";

import hasuraEventsResponseMock from "./mocks/hasuraEventsResponseMock";
import { Destination } from "./model";
import SendComponent from "./Public";

jest.spyOn(axios, "default").mockImplementation((url: any) => {
  return {
    value: url()?.startsWith(
      `${process.env.REACT_APP_API_URL}/create-send-events/`
    )
      ? hasuraEventsResponseMock
      : null,
  } as any;
});

jest.spyOn(ReactNavi, "useCurrentRoute").mockImplementation(
  () =>
    ({
      data: {
        flowName: "apply for a lawful development certificate",
      },
    } as any)
);

it.todo("renders correctly");

it.todo("sets :localAuthority API param correctly based on team or passport");

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
