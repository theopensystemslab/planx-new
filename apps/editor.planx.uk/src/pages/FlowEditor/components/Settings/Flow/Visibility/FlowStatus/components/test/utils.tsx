import {
  MockedProvider,
  type MockedProviderProps,
} from "@apollo/client/testing";
import { screen, waitForElementToBeRemoved } from "@testing-library/react";
import React from "react";
import { setup } from "testUtils";

import FlowStatus from "../..";

export const setupFlowStatusScreen = async (
  mocks: MockedProviderProps["mocks"],
) => {
  const { user } = setup(
    <MockedProvider mocks={mocks}>
      <FlowStatus />
    </MockedProvider>,
  );

  await waitForElementToBeRemoved(() => screen.getByText("Loading..."));
  return user;
};

export const disabledCopyCheck = () => {
  const copyButton = screen.getByRole("button", { name: "copy" });
  expect(copyButton).toBeDisabled();
};

export const enabledCopyCheck = () => {
  const copyButton = screen.getByRole("button", { name: "copy" });
  expect(copyButton).toBeEnabled();
};

export const inactiveLinkCheck = async (link: string) => {
  const publicLink = await screen.findByText(link);
  expect(publicLink.tagName).toBe("P");
};

export const activeLinkCheck = async (link: string) => {
  const publicLink = await screen.findByText(`${link}`);

  expect(publicLink.tagName).toBe("A");
};
