import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  type FileUploadAndLabelSlot,
  getTagsForSlot,
  removeSlots,
} from "../../model";
import {
  type FileUploadAction,
  fileUploadAndLabelReducer,
  type FileUploadState,
} from "./fileUploadAndLabelReducer";

vi.mock("../../model", () => ({
  getTagsForSlot: vi.fn(),
  removeSlots: vi.fn(),
}));

const mockFileA = {
  id: "slot-A",
  file: { path: "a.pdf" },
  drawingNumber: "123",
} as FileUploadAndLabelSlot;
const mockFileB = {
  id: "slot-B",
  file: { path: "b.pdf" },
  drawingNumber: "456",
} as FileUploadAndLabelSlot;
const mockFileC = {
  id: "slot-C",
  file: { path: "c.pdf" },
} as FileUploadAndLabelSlot;

const baseState: FileUploadState = {
  slots: [],
  fileList: { required: [], recommended: [], optional: [] },
  pendingRemoval: null,
  removingSlotId: null,
};

describe("fileUploadAndLabelReducer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("SET_SLOTS action", () => {
    it("clears dropzoneError and auto-expands when a new file is added", () => {
      const state: FileUploadState = {
        ...baseState,
        slots: [mockFileA],
        errors: { dropzone: "Please upload a file." },
        expandedSlotId: "slot-A",
      };

      const action: FileUploadAction = {
        type: "SET_SLOTS",
        payload: [mockFileA, mockFileB],
      };

      const result = fileUploadAndLabelReducer(state, action);

      expect(result.slots).toHaveLength(2);
      expect(result.errors?.dropzone).toBeUndefined();
      expect(result.expandedSlotId).toBe("slot-B");
    });

    it("does not clear errors or change expansion when an existing file updates (e.g. progress bar update)", () => {
      const state: FileUploadState = {
        ...baseState,
        slots: [mockFileA],
        errors: { dropzone: "Some other error" },
        expandedSlotId: "slot-A",
      };

      const updatedFileA = { ...mockFileA, progress: 50 };
      const action: FileUploadAction = {
        type: "SET_SLOTS",
        payload: [updatedFileA],
      };

      const result = fileUploadAndLabelReducer(state, action);

      expect(result.errors?.dropzone).toBe("Some other error");
      expect(result.expandedSlotId).toBe("slot-A");
    });
  });

  describe("SAVE_SLOT action", () => {
    it("advances expandedSlotId to the next untagged file", () => {
      const state: FileUploadState = {
        ...baseState,
        slots: [mockFileA, mockFileB, mockFileC],
        expandedSlotId: "slot-A",
        errors: { fileList: "Missing tags" },
      };

      vi.mocked(getTagsForSlot).mockImplementation((slotId) => {
        if (slotId === "slot-A") return ["Site Plan"];
        if (slotId === "slot-B") return ["Elevations"];
        // Only C is untagged - we should jump to this
        if (slotId === "slot-C") return [];
        return [];
      });

      const action: FileUploadAction = {
        type: "SAVE_SLOT",
        payload: { slotId: "slot-A" },
      };
      const result = fileUploadAndLabelReducer(state, action);

      expect(result.expandedSlotId).toBe("slot-C");
      expect(result.errors?.fileList).toBeUndefined();
    });

    it("sets expandedSlotId to undefined if all subsequent files are fully tagged", () => {
      const state: FileUploadState = {
        ...baseState,
        slots: [mockFileA, mockFileB],
      };

      vi.mocked(getTagsForSlot).mockReturnValue(["Some Tag"]);

      const action: FileUploadAction = {
        type: "SAVE_SLOT",
        payload: { slotId: "slot-A" },
      };
      const result = fileUploadAndLabelReducer(state, action);

      // Nothing to tag, no open slots
      expect(result.expandedSlotId).toBeUndefined();
    });
  });

  describe("Two-step file removal", () => {
    describe("INIT_REMOVE_FILE action", () => {
      it("queues the file for removal and triggers the animation state without deleting data", () => {
        const state: FileUploadState = {
          ...baseState,
          slots: [mockFileA, mockFileB],
          expandedSlotId: "slot-A",
        };

        const action: FileUploadAction = {
          type: "INIT_REMOVE_FILE",
          payload: { slot: mockFileA },
        };

        const result = fileUploadAndLabelReducer(state, action);

        expect(result.slots).toHaveLength(2);
        expect(result.pendingRemoval).toEqual(mockFileA);
        expect(result.removingSlotId).toBe("slot-A");
        expect(result.expandedSlotId).toBeUndefined();
      });
    });

    describe("COMPLETE_REMOVE_FILE action", () => {
      it("deletes the data and resets the animation variables", () => {
        const state: FileUploadState = {
          ...baseState,
          slots: [mockFileA, mockFileB],
          pendingRemoval: mockFileA,
          removingSlotId: "slot-A",
        };

        const mockUpdatedFileList = {
          required: [],
          recommended: [],
          optional: [],
        };
        vi.mocked(removeSlots).mockReturnValue(mockUpdatedFileList);

        const action: FileUploadAction = { type: "COMPLETE_REMOVE_FILE" };
        const result = fileUploadAndLabelReducer(state, action);

        expect(result.slots).toHaveLength(1);
        expect(result.slots[0].id).toBe("slot-B");
        expect(result.slots[0]).toEqual("456");
        expect(result.pendingRemoval).toBeNull();
        expect(result.removingSlotId).toBeNull();
        expect(result.fileList).toBe(mockUpdatedFileList);
      });

      it("clears validation errors when the last file is deleted", () => {
        const state: FileUploadState = {
          ...baseState,
          slots: [mockFileA],
          pendingRemoval: mockFileA,
          errors: {
            fileList: "Error",
            fileLabel: { "slot-A": "Missing label" },
          },
        };

        const action: FileUploadAction = { type: "COMPLETE_REMOVE_FILE" };
        const result = fileUploadAndLabelReducer(state, action);

        expect(result.slots).toHaveLength(0);
        expect(result.errors?.fileList).toBeUndefined();
        expect(result.errors?.fileLabel).toBeUndefined();
      });
    });
  });

  describe("UI Interactions", () => {
    it("EXPAND_SLOT action sets the expanded ID and clears validation errors", () => {
      const state: FileUploadState = {
        ...baseState,
        expandedSlotId: "slot-A",
        errors: {
          fileList: "Error",
          fileLabel: { "slot-B": "Error" },
        },
      };

      const result = fileUploadAndLabelReducer(state, {
        type: "EXPAND_SLOT",
        payload: { slotId: "slot-B" },
      });

      expect(result.expandedSlotId).toBe("slot-B");
      expect(result.errors?.fileList).toBeUndefined();
      expect(result.errors?.fileLabel).toBeUndefined();
    });
  });
});
