import { User } from "@opensystemslab/planx-core/types";
import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import { FullStore, useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { setup } from "testUtils";
import { it, vi } from "vitest";
import { axe } from "vitest-axe";

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
    const { getState, setState } = useStore;
    const mockUser: User = {
      id: 123,
      email: "b.baggins@shire.com",
      isPlatformAdmin: true,
      isAnalyst: true,
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
      expect(getByText("GOV.UK Pay metadata")).toBeInTheDocument();
    });

    it("lists the default values", () => {
      const { getByDisplayValue, getByRole } = setup(
        <DndProvider backend={HTML5Backend}>
          <PayComponent id="test" />
        </DndProvider>,
      );
      expect(getByDisplayValue("flow")).toBeInTheDocument();
      expect(getByDisplayValue("source")).toBeInTheDocument();
      const autocomplete = screen
        .getAllByRole<HTMLInputElement>("combobox")
        .find(({ value }) => value === "paidViaInviteToPay");
      expect(autocomplete).toBeDefined();
      expect(autocomplete).toHaveValue("paidViaInviteToPay");
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

    it("pre-populates existing values", () => {
      const node = {
        data: {
          govPayMetadata: [
            {
              key: "myKey",
              value: "myValue",
              type: "static",
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

    it("allows new values to be added", { timeout: 20000 }, async () => {
      act(() => setState({ user: mockUser, flowName: "test flow" }));

      const handleSubmit = vi.fn();

      const { getAllByPlaceholderText, getAllByLabelText, user, getByRole } =
        setup(
          <DndProvider backend={HTML5Backend}>
            <PayComponent
              id="test"
              handleSubmit={handleSubmit}
              node={{ data: { fn: "application.fee.payable" } }}
            />
          </DndProvider>,
        );

      // Three default rows displayed
      expect(getAllByLabelText("Delete")).toHaveLength(3);

      await user.click(getByRole("button", { name: "add new static field" }));

      // New row added
      expect(getAllByLabelText("Delete")).toHaveLength(4);

      const keyInput = getAllByPlaceholderText("key")[2];
      const valueInput = getAllByPlaceholderText("value")[2];

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
          fn: "application.fee.payable",
          govPayMetadata: [
            { key: "flow", value: "flowName", type: "static" },
            { key: "source", value: "PlanX", type: "static" },
            { key: "paidViaInviteToPay", value: "paidViaInviteToPay", type: "data" },
            { key: "deleteMe", value: "abc123", type: "static" },
          ],
        },
      };

      const handleSubmit = vi.fn();

      const { getAllByLabelText, user, getByRole } = setup(
        <DndProvider backend={HTML5Backend}>
          <PayComponent id="test" handleSubmit={handleSubmit} node={mockNode} />
        </DndProvider>,
      );

      // Use delete buttons as proxy for rows
      const deleteButtons = getAllByLabelText("Delete");
      expect(deleteButtons).toHaveLength(4);
      const finalStaticDeleteButton = deleteButtons[2];
      expect(finalStaticDeleteButton).toBeInTheDocument();

      await user.click(finalStaticDeleteButton);
      await waitFor(() => {
        expect(getAllByLabelText("Delete")).toHaveLength(3);
      });

      // Required to trigger submission outside the context of FormModal component
      fireEvent.submit(getByRole("form"));

      await waitFor(() => expect(handleSubmit).toHaveBeenCalled());

      expect(handleSubmit.mock.lastCall?.[0].data.govPayMetadata).toEqual([
        { key: "flow", value: "flowName", type: "static" },
        { key: "source", value: "PlanX", type: "static" },
        {
          key: "paidViaInviteToPay",
          value: "paidViaInviteToPay",
          type: "data",
        },
      ]);
    });

    it("displays field-level errors", async () => {
      act(() => setState({ user: mockUser, flowName: "test flow" }));

      const handleSubmit = vi.fn();

      const { getByText, user, getByRole } = setup(
        <DndProvider backend={HTML5Backend}>
          <PayComponent id="test" handleSubmit={handleSubmit} />
        </DndProvider>,
      );

      await user.click(getByRole("button", { name: "add new static field" }));
      fireEvent.submit(getByRole("form"));

      expect(handleSubmit).not.toHaveBeenCalled();

      // Test that validation schema is wired up to UI
      // model.test.ts tests validation schema behaviour in-depth
      await waitFor(() =>
        expect(getByText(/Key is a required field/)).toBeVisible(),
      );
    });

    it("displays array-level errors", { timeout: 20000 }, async () => {
      act(() => setState({ user: mockUser, flowName: "test flow" }));

      const handleSubmit = vi.fn();

      const { getByText, user, getByRole, getAllByPlaceholderText } = setup(
        <DndProvider backend={HTML5Backend}>
          <PayComponent id="test" handleSubmit={handleSubmit} />
        </DndProvider>,
      );

      // Add first duplicate key
      await user.click(getByRole("button", { name: "add new static field" }));
      const keyInput4 = getAllByPlaceholderText("key")[2];
      const valueInput4 = getAllByPlaceholderText("value")[2];
      await user.type(keyInput4, "duplicatedKey");
      await user.type(valueInput4, "myNewValue");

      // Add second duplicate key
      await user.click(getByRole("button", { name: "add new static field" }));
      const keyInput5 = getAllByPlaceholderText("key")[3];
      const valueInput5 = getAllByPlaceholderText("value")[3];
      await user.type(keyInput5, "duplicatedKey");
      await user.type(valueInput5, "myNewValue");

      fireEvent.submit(getByRole("form"));

      expect(handleSubmit).not.toHaveBeenCalled();

      // Test that validation schema is wired up to UI
      // model.test.ts tests validation schema behaviour in-depth
      await waitFor(() =>
        expect(getByText(/Keys must be unique/)).toBeVisible(),
      );
    });

    it("only disables the first instance of a required field", async () => {
      act(() => setState({ user: mockUser, flowName: "test flow" }));

      const handleSubmit = vi.fn();

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
            node={{ data: { fn: "application.fee.payable" } }}
          />
        </DndProvider>,
      );

      await user.click(getByRole("button", { name: "add new static field" }));

      const keyInput = getAllByPlaceholderText("key")[2];
      const valueInput = getAllByPlaceholderText("value")[2];

      await user.type(keyInput, "flow");

      expect(valueInput).toBeEnabled();
      await user.type(valueInput, "myNewValue");

      // Required to trigger submission outside the context of FormModal component
      fireEvent.submit(getByRole("form"));

      expect(handleSubmit).not.toHaveBeenCalled();

      // Test that validation schema is wired up to UI
      await waitFor(() =>
        expect(getByText(/Keys must be unique/)).toBeVisible(),
      );

      const duplicateKeyDeleteIcon = getAllByLabelText("Delete")[2];

      // This tests that the user is able to fix their mistake
      expect(duplicateKeyDeleteIcon).toBeEnabled();
    }, 10_000);
  });
});
