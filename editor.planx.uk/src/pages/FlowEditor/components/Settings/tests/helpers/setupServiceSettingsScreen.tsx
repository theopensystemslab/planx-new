import { screen } from "@testing-library/react";
import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { setup } from "testUtils";

import ServiceSettings from "../../ServiceSettings";

export default async function setupServiceSettingsScreen() {
  const { user } = setup(
    <DndProvider backend={HTML5Backend}>
      <ServiceSettings />
    </DndProvider>,
  );

  await screen.findByText("Your public link");
  return user;
}

export const mockWindowLocationObject = {
  origin: "https://mocked-origin.com",
  hash: "",
  host: "dummy.com",
  port: "80",
  protocol: "http:",
  hostname: "dummy.com",
  href: "http://dummy.com?page=1&name=testing",
  pathname: "/mockTeam/mock-planning-permish",
  search: "",
  assign: jest.fn(),
  reload: jest.fn(),
  replace: jest.fn(),
  ancestorOrigins: {
    length: 0,
    contains: () => true,
    item: () => null,
    [Symbol.iterator]: jest.fn(),
  },
};
