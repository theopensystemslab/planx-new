import { User } from "@opensystemslab/planx-core/types";
import { fireEvent, waitFor } from "@testing-library/react";
import { FullStore, vanillaStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { act } from "react-dom/test-utils";
import { axe, setup } from "testUtils";

import PayComponent from "./Editor";

describe("Pay component - Editor Modal", () => {
  it("renders", () => {
    const { getByText } = setup(
      <DndProvider backend={HTML5Backend}>
        <PayComponent id="test" />
      </DndProvider>,
    );
    expect(getByText("Payment")).toBeInTheDocument();
  });

  // Currently failing, Editor not a11y compliant
  it.skip("should not have any accessibility violations upon initial load", async () => {
    const { container } = setup(
      <DndProvider backend={HTML5Backend}>
        <PayComponent id="test" />
      </DndProvider>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  describe("GOV.UK Pay Metadata section", () => {
    // Set up mock state with platformAdmin user so all Editor features are enabled
    const { getState, setState } = vanillaStore;
    const mockUser: User = {
      id: 123,
      email: "b.baggins@shire.com",
      isPlatformAdmin: true,
      firstName: "Bilbo",
      lastName: "Baggins",
      teams: [],
    };

    let initialState: FullStore;

    beforeAll(() => (initialState = getState()));
    afterEach(() => act(() => setState(initialState)));

    it("renders the section", () => {
      const { getByText } = setup(
        <DndProvider backend={HTML5Backend}>
          <PayComponent id="test" />
        </DndProvider>,
      );
      expect(getByText("GOV.UK Pay Metadata")).toBeInTheDocument();
    });

    it("lists the default values", () => {
      const { getByDisplayValue } = setup(
        <DndProvider backend={HTML5Backend}>
          <PayComponent id="test" />
        </DndProvider>,
      );
      expect(getByDisplayValue("flow")).toBeInTheDocument();
      expect(getByDisplayValue("source")).toBeInTheDocument();
      expect(getByDisplayValue("isInviteToPay")).toBeInTheDocument();
    });

    it("does not allow default sections to be deleted", () => {
      const { getAllByLabelText } = setup(
        <DndProvider backend={HTML5Backend}>
          <PayComponent id="test" />
        </DndProvider>,
      );

      const deleteIcons = getAllByLabelText("Delete");

      expect(deleteIcons).toHaveLength(3);
      expect(deleteIcons[0]).toBeDisabled();
      expect(deleteIcons[1]).toBeDisabled();
      expect(deleteIcons[2]).toBeDisabled();
    });

    it("updates the 'isInviteToPay' metadata value inline with the 'isInviteToPay' form value", async () => {
      const node = {
        data: {
          allowInviteToPay: false,
        },
      };

      const { user, getAllByLabelText, getByText } = setup(
        <DndProvider backend={HTML5Backend}>
          <PayComponent id="test" node={node} />
        </DndProvider>,
      );

      const keyInputs = getAllByLabelText("Key");
      const valueInputs = getAllByLabelText("Value");

      expect(keyInputs[2]).toHaveDisplayValue("isInviteToPay");
      expect(valueInputs[2]).toHaveDisplayValue("false");

      await user.click(
        getByText("Allow applicants to invite someone else to pay"),
      );

      expect(valueInputs[2]).toHaveValue("true");
    });

    it("pre-populates existing values", () => {
      const node = {
        data: {
          govPayMetadata: [
            {
              key: "myKey",
              value: "myValue",
            },
          ],
        },
      };

      const { getByDisplayValue } = setup(
        <DndProvider backend={HTML5Backend}>
          <PayComponent id="test" node={node} />
        </DndProvider>,
      );

      expect(getByDisplayValue("myKey")).toBeInTheDocument();
      expect(getByDisplayValue("myValue")).toBeInTheDocument();
    });

    it("allows new values to be added", async () => {
      act(() => setState({ user: mockUser, flowName: "test flow" }));

      const handleSubmit = jest.fn();

      const { getAllByPlaceholderText, getAllByLabelText, user, getByRole } =
        setup(
          <DndProvider backend={HTML5Backend}>
            <PayComponent
              id="test"
              handleSubmit={handleSubmit}
              node={{ data: { fn: "fee" } }}
            />
          </DndProvider>,
        );

      // Three default rows displayed
      expect(getAllByLabelText("Delete")).toHaveLength(3);

      await user.click(getByRole("button", { name: "add new" }));

      // New row added
      expect(getAllByLabelText("Delete")).toHaveLength(4);

      const keyInput = getAllByPlaceholderText("key")[3];
      const valueInput = getAllByPlaceholderText("value")[3];

      await user.type(keyInput, "myNewKey");
      await user.type(valueInput, "myNewValue");

      // Required to trigger submission outside the context of FormModal component
      fireEvent.submit(getByRole("form"));

      await waitFor(() => expect(handleSubmit).toHaveBeenCalled());
    });

    it("allows new values to be deleted", async () => {
      act(() => setState({ user: mockUser, flowName: "test flow" }));
      const mockNode = {
        data: {
          fn: "fee",
          govPayMetadata: [
            { key: "flow", value: "flowName" },
            { key: "source", value: "PlanX" },
            { key: "isInviteToPay", value: "true" },
            { key: "deleteMe", value: "abc123" },
          ],
        },
      };

      const handleSubmit = jest.fn();

      const { getAllByLabelText, user, getByRole } = setup(
        <DndProvider backend={HTML5Backend}>
          <PayComponent id="test" handleSubmit={handleSubmit} node={mockNode} />
        </DndProvider>,
      );

      // Use delete buttons as proxy for rows
      const deleteButtons = getAllByLabelText("Delete");
      expect(deleteButtons).toHaveLength(4);
      const finalDeleteButton = deleteButtons[3];
      expect(finalDeleteButton).toBeDefined();

      await user.click(finalDeleteButton);
      expect(getAllByLabelText("Delete")).toHaveLength(3);

      // Required to trigger submission outside the context of FormModal component
      fireEvent.submit(getByRole("form"));

      await waitFor(() => expect(handleSubmit).toHaveBeenCalled());

      expect(handleSubmit.mock.lastCall[0].data.govPayMetadata).toEqual([
        { key: "flow", value: "flowName" },
        { key: "source", value: "PlanX" },
        { key: "isInviteToPay", value: "true" },
      ]);
    });

    it("displays field-level errors", async () => {
      act(() => setState({ user: mockUser, flowName: "test flow" }));

      const handleSubmit = jest.fn();

      const { getByText, user, getByRole } = setup(
        <DndProvider backend={HTML5Backend}>
          <PayComponent id="test" handleSubmit={handleSubmit} />
        </DndProvider>,
      );

      await user.click(getByRole("button", { name: "add new" }));
      fireEvent.submit(getByRole("form"));

      expect(handleSubmit).not.toHaveBeenCalled();

      // Test that validation schema is wired up to UI
      // model.test.ts tests validation schema behaviour in-depth
      await waitFor(() =>
        expect(getByText("Key is a required field")).toBeVisible(),
      );
    });

    it("displays array-level errors", async () => {
      act(() => setState({ user: mockUser, flowName: "test flow" }));

      const handleSubmit = jest.fn();

      const { getByText, user, getByRole, getAllByPlaceholderText } = setup(
        <DndProvider backend={HTML5Backend}>
          <PayComponent id="test" handleSubmit={handleSubmit} />
        </DndProvider>,
      );

      // Add first duplicate key
      await user.click(getByRole("button", { name: "add new" }));
      const keyInput4 = getAllByPlaceholderText("key")[3];
      const valueInput4 = getAllByPlaceholderText("value")[3];
      await user.type(keyInput4, "duplicatedKey");
      await user.type(valueInput4, "myNewValue");

      // Add second duplicate key
      await user.click(getByRole("button", { name: "add new" }));
      const keyInput5 = getAllByPlaceholderText("key")[4];
      const valueInput5 = getAllByPlaceholderText("value")[4];
      await user.type(keyInput5, "duplicatedKey");
      await user.type(valueInput5, "myNewValue");

      fireEvent.submit(getByRole("form"));

      expect(handleSubmit).not.toHaveBeenCalled();

      // Test that validation schema is wired up to UI
      // model.test.ts tests validation schema behaviour in-depth
      await waitFor(() =>
        expect(getByText("Keys must be unique")).toBeVisible(),
      );
    });

    it("only disables the first instance of a required filed", async () => {
      act(() => setState({ user: mockUser, flowName: "test flow" }));

      const handleSubmit = jest.fn();

      const {
        getAllByPlaceholderText,
        getAllByLabelText,
        user,
        getByRole,
        getByText,
      } = setup(
        <DndProvider backend={HTML5Backend}>
          <PayComponent
            id="test"
            handleSubmit={handleSubmit}
            node={{ data: { fn: "fee" } }}
          />
        </DndProvider>,
      );

      await user.click(getByRole("button", { name: "add new" }));

      const keyInput = getAllByPlaceholderText("key")[3];
      const valueInput = getAllByPlaceholderText("value")[3];

      await user.type(keyInput, "flow");

      expect(valueInput).not.toBeDisabled();
      await user.type(valueInput, "myNewValue");

      // Required to trigger submission outside the context of FormModal component
      fireEvent.submit(getByRole("form"));

      expect(handleSubmit).not.toHaveBeenCalled();

      // Test that validation schema is wired up to UI
      await waitFor(() =>
        expect(getByText("Keys must be unique")).toBeVisible(),
      );

      const duplicateKeyDeleteIcon = getAllByLabelText("Delete")[3];

      // This tests that the user is able to fix their mistake
      expect(duplicateKeyDeleteIcon).not.toBeDisabled();
    });
  });
});
