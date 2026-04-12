import { screen, waitForElementToBeRemoved } from "@testing-library/react";
import { delay, graphql, HttpResponse } from "msw";
import React from "react";
import server from "test/mockServer";
import { setup } from "testUtils";

import FlowStatus from "../..";
import type { GetFlowStatus } from "../../types";

export const setupFlowStatusScreen = async (data: GetFlowStatus) => {
  server.use(
    graphql.query("GetFlowStatus", async () => {
      await delay(100);
      return HttpResponse.json({ data });
    }),
  );

  const { user } = await setup(<FlowStatus />);

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
