import { screen } from "@testing-library/react";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { setup } from "testUtils";

import FileUploadAndLabelComponent from "./Editor";

const { getState } = useStore;

describe("FileUploadAndLabel - Editor Modal", () => {
  // TODO correctly mock an authenticated Platform Admin user so 'add' button is enabled in final test
  beforeEach(() => {
    getState().setUser({
      id: 1,
      firstName: "Editor",
      lastName: "Test",
      isPlatformAdmin: true,
      isAnalyst: false,
      email: "test@test.com",
      teams: [],
      jwt: "x.y.z",
    });
  });

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
    expect(screen.getAllByPlaceholderText("File type")).toHaveLength(1);
  });

  it("allows an Editor to add multiple rules", async () => {
    const { user } = setup(
      <DndProvider backend={HTML5Backend}>
        <FileUploadAndLabelComponent id="test" />
      </DndProvider>,
    );
    await user.click(screen.getByText("Add file type"));
    await user.click(screen.getByText("Add file type"));

    expect(screen.getAllByPlaceholderText("File type")).toHaveLength(3);
  });
});
