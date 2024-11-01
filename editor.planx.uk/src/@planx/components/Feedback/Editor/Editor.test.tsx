import { screen } from "@testing-library/react";
import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { setup } from "testUtils";

import { FeedbackEditor } from "./Editor";

describe("When the Feedback editor modal is rendered", () => {
  it("does not throw an error", () => {
    setup(
      <DndProvider backend={HTML5Backend}>
        <FeedbackEditor id="test-feedback-editor" />
      </DndProvider>,
    );
    expect(screen.getByText("Feedback")).toBeInTheDocument();
  });
});
