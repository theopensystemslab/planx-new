import { screen } from "@testing-library/react";
import { toggleFeatureFlag } from "lib/featureFlags";
import React from "react";
import { axe, setup } from "testUtils";

import Confirm from "./Confirm";
import Pay from "./Pay";

it("renders correctly with <= £0 fee", () => {
  const handleSubmit = jest.fn();

  // if no props.fn, then fee defaults to 0
  setup(<Pay handleSubmit={handleSubmit} />);

  // handleSubmit is still called to set auto = true so Pay isn't seen in card sequence
  expect(handleSubmit).toHaveBeenCalled();
});

it("does not show the nominate to pay link if the featureFlag is disabled", () => {
  const onConfirm = jest.fn();

  setup(<Confirm fee={1} onConfirm={onConfirm} showInviteToPay={false} />);

  expect(
    screen.queryByText("Nominate someone else to pay for this application")
  ).not.toBeInTheDocument();
  expect(
    screen.getByText("Tell us other ways you'd like to pay in the future")
  ).toBeInTheDocument();
});

it("should not have any accessibility violations", async () => {
  const handleSubmit = jest.fn();
  const { container } = setup(<Pay handleSubmit={handleSubmit} />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
