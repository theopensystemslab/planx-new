import { act, screen } from "@testing-library/react";
import { FullStore, useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { setup } from "testUtils";
import { it } from "vitest";

import Footer from "./Footer";

const testDate = new Date(2025, 0, 30).toString();

const { getState, setState } = useStore;

let initialState: FullStore;

describe("Footer component", () => {
  beforeAll(() => (initialState = getState()));

  beforeEach(() => {
    getState().setLastPublishedDate(testDate);
  });

  afterEach(() => {
    act(() => setState(initialState));
  });

  it("renders the last published date", async () => {
    await setup(<Footer />);

    expect(
      screen.getByText("Service last updated 30/01/2025"),
    ).toBeInTheDocument();
  });
});
