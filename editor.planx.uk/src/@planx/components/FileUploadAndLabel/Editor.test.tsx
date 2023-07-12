import { screen } from "@testing-library/react";
import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { setup } from "testUtils";

import FileUploadAndLabelComponent from "./Editor";

describe("FileUploadAndLabel - Editor Modal", () => {
  it("renders", () => {
    setup(
      <DndProvider backend={HTML5Backend}>
        <FileUploadAndLabelComponent id="test" />
      </DndProvider>,
    );
    expect(screen.getByText("Upload and label")).toBeInTheDocument();
  });

  it("initialises with a single rule", () => {
    setup(
      <DndProvider backend={HTML5Backend}>
        <FileUploadAndLabelComponent id="test" />
      </DndProvider>,
    );
    expect(screen.getAllByText("File")).toHaveLength(1);
  });

  it("allows an Editor to add multiple rules", async () => {
    const { user } = setup(
      <DndProvider backend={HTML5Backend}>
        <FileUploadAndLabelComponent id="test" />
      </DndProvider>,
    );
    await user.click(screen.getByText("add new"));
    await user.click(screen.getByText("add new"));

    expect(screen.getAllByText("File")).toHaveLength(3);
  });
});
