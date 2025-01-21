import { act } from "@testing-library/react";
import { FullStore, useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { setup } from "testUtils";
import { axe } from "vitest-axe";

import { ReadMePage, ReadMePageProps } from "./ReadMePage";

const { getState, setState } = useStore;

let initialState: FullStore;

const defaultProps = {
  flowSlug: "find-out-if-you-need-planning-permission",
  flowInformation: {
    status: "online",
    description: "A long description of a service",
    summary: "A short blurb",
    limitations: "",
    settings: {},
  },
} as ReadMePageProps;

describe("Read Me Page component", () => {
  beforeAll(() => (initialState = getState()));

  afterEach(() => {
    act(() => setState(initialState));
  });

  it.todo("renders and submits data without an error");

  it.todo(
    "throws an error if the service description is longer than 120 characters"
  );

  it.todo(
    "displays data in the fields if there is already flow information in the database"
  );

  it.todo(
    "counts down the number of characters remaining on the service description field"
  );

  it.todo("displays an error toast if there is a server-side issue");

  //   it("will save matching emails to state", async () => {
  //     const children = <Button>Testing 123</Button>;
  //     const { user } = setup(<SaveAndReturn children={children}></SaveAndReturn>);
  //     expect(getState().saveToEmail).toBeUndefined();

  //     await user.type(screen.getByLabelText("Email address"), "test@test.com");
  //     await user.type(
  //       screen.getByLabelText("Confirm email address"),
  //       "test@test.com"
  //     );
  //     await user.click(screen.getByTestId("continue-button"));

  //     expect(getState().saveToEmail).toEqual("test@test.com");
  //     expect(screen.getByText("Testing 123")).toBeInTheDocument();
  //   });

  it("should not have any accessibility violations", async () => {
    const { container } = setup(
      <DndProvider backend={HTML5Backend}>
        <ReadMePage {...defaultProps} />
      </DndProvider>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
