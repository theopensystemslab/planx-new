import { screen } from "@testing-library/react";
import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { setup } from "test/utils";

import { FeedbackEditor } from "./Editor";

describe("When the Feedback editor modal is rendered", () => {
  beforeEach(async () => {
    await setup(
      <DndProvider backend={HTML5Backend}>
        <FeedbackEditor id="test-feedback-editor" />
      </DndProvider>,
    );
  });
  it("displays the default title if no edits are made", () => {
    expect(
      screen.getByPlaceholderText("Tell us what you think"),
    ).toBeInTheDocument();
  });
});
