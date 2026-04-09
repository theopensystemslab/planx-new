import type { FileUploadSlot } from "@planx/components/FileUpload/model";
import type { SetStateAction } from "react";
import { exhaustiveCheck } from "utils";

import { type FileList, getTagsForSlot, removeSlots } from "../../model";

export interface FileUploadState {
  slots: FileUploadSlot[];
  fileList: FileList;
  drawingNumbers: Record<string, string>;
  /**
   * Accordion state: only one file can be expanded for editing at a time
   */
  expandedSlotId?: string;
  pendingRemoval: FileUploadSlot | null;
  removingSlotId: string | null;
  fileUploadStatus?: string;
  fileListError?: string;
  dropzoneError?: string;
  fileLabelErrors?: Record<string, string>;
}

export const initialState: FileUploadState = {
  slots: [],
  drawingNumbers: {},
  fileList: {
    required: [],
    recommended: [],
    optional: [],
  },
  pendingRemoval: null,
  removingSlotId: null,
  fileUploadStatus: undefined,
};

export type FileUploadAction =
  // Data updates
  | {
      type: "UPDATE_DRAWING_NUMBER";
      payload: { slotId: string; value: string };
    }
  | { type: "REMOVE_DRAWING_NUMBER"; payload: { slotId: string } }

  // UI interactions
  | { type: "EXPAND_SLOT"; payload: { slotId?: string } }
  | { type: "SAVE_SLOT"; payload: { slotId: string } }

  // Validation errors
  | { type: "SET_FILE_LIST_ERROR"; payload: { error: string } }
  | { type: "SET_DROPZONE_ERROR"; payload: { error?: string } }
  | {
      type: "SET_FILE_LABEL_ERRORS";
      payload: { errors: Record<string, string> };
    }

  // File removal- Two-step process required to allow UI to animate out before data is deleted
  | { type: "INIT_REMOVE_FILE"; payload: { slot: FileUploadSlot } }
  | { type: "COMPLETE_REMOVE_FILE" }

  // Adapters - allow child components to dispatch updated via setState calls
  | { type: "SET_SLOTS"; payload: SetStateAction<FileUploadSlot[]> }
  | { type: "SET_FILE_LIST"; payload: SetStateAction<FileList> }
  | {
      type: "SET_FILE_UPLOAD_STATUS";
      payload: SetStateAction<string | undefined>;
    };

export const fileUploadAndLabelReducer = (
  state: FileUploadState,
  action: FileUploadAction,
): FileUploadState => {
  switch (action.type) {
    case "UPDATE_DRAWING_NUMBER":
      return {
        ...state,
        drawingNumbers: {
          ...state.drawingNumbers,
          [action.payload.slotId]: action.payload.value,
        },
      };

    case "REMOVE_DRAWING_NUMBER": {
      const newDrawingNumbers = { ...state.drawingNumbers };
      delete newDrawingNumbers[action.payload.slotId];

      return {
        ...state,
        drawingNumbers: newDrawingNumbers,
      };
    }

    case "EXPAND_SLOT": {
      return {
        ...state,
        expandedSlotId: action.payload.slotId,
        fileListError: undefined,
        fileLabelErrors: undefined,
      };
    }

    case "SAVE_SLOT": {
      const currentIndex = state.slots.findIndex(
        ({ id }) => id === action.payload.slotId,
      );

      // Find the next file that has no tags yet
      const nextUntagged = state.slots.find((s, i) => {
        if (i <= currentIndex) return false;
        const tags = getTagsForSlot(s.id, state.fileList);
        return tags.length === 0;
      });

      return {
        ...state,
        expandedSlotId: nextUntagged?.id,
        fileListError: undefined,
        fileLabelErrors: undefined,
      };
    }

    case "SET_FILE_LIST_ERROR": {
      return {
        ...state,
        fileListError: action.payload.error,
      };
    }

    case "SET_DROPZONE_ERROR": {
      return {
        ...state,
        dropzoneError: action.payload.error,
      };
    }

    case "SET_FILE_LABEL_ERRORS": {
      return {
        ...state,
        fileLabelErrors: action.payload.errors,
      };
    }

    case "INIT_REMOVE_FILE": {
      return {
        ...state,
        // Close the accordion if the one they are deleting is currently open
        expandedSlotId:
          state.expandedSlotId === action.payload.slot.id
            ? undefined
            : state.expandedSlotId,
        // Queue the file for deletion and trigger the UI exit animation
        pendingRemoval: action.payload.slot,
        removingSlotId: action.payload.slot.id,
      };
    }

    case "COMPLETE_REMOVE_FILE": {
      if (!state.pendingRemoval) return state;
      const slot = state.pendingRemoval;

      // Remove from slots array
      const newSlots = state.slots.filter((s) => s.id !== slot.id);

      // Remove from fileList object
      // TODO: Single source of truth, no need to sync this
      const updatedFileList = removeSlots(
        getTagsForSlot(slot.id, state.fileList),
        slot,
        state.fileList,
      );

      // Clean up drawing numbers
      // TODO: Make this a property of slots
      const newDrawingNumbers = { ...state.drawingNumbers };
      delete newDrawingNumbers[slot.id];

      return {
        ...state,
        slots: newSlots,
        fileList: updatedFileList,
        drawingNumbers: newDrawingNumbers,
        fileUploadStatus: `${slot.file.path} was deleted`,

        // Reset animation states
        removingSlotId: null,
        pendingRemoval: null,

        // Clear errors if they deleted the last file
        fileListError: newSlots.length === 0 ? undefined : state.fileListError,
        fileLabelErrors:
          newSlots.length === 0 ? undefined : state.fileLabelErrors,
      };
    }

    case "SET_SLOTS": {
      const nextSlots =
        typeof action.payload === "function"
          ? action.payload(state.slots)
          : action.payload;

      const isNewFileAdded = nextSlots.length > state.slots.length;
      const newlyAddedSlotId = isNewFileAdded
        ? nextSlots[state.slots.length].id
        : state.expandedSlotId;

      return {
        ...state,
        slots: nextSlots,
        // Clear error on new upload
        dropzoneError: isNewFileAdded ? undefined : state.dropzoneError,
        // Auto-expand if a new file was just added
        expandedSlotId: newlyAddedSlotId,
      };
    }

    case "SET_FILE_UPLOAD_STATUS": {
      const nextStatus =
        typeof action.payload === "function"
          ? action.payload(state.fileUploadStatus)
          : action.payload;

      return {
        ...state,
        fileUploadStatus: nextStatus,
      };
    }

    case "SET_FILE_LIST": {
      const nextFileList =
        typeof action.payload === "function"
          ? action.payload(state.fileList)
          : action.payload;

      return {
        ...state,
        fileList: nextFileList,
        fileListError: undefined,
        fileLabelErrors: undefined,
      };
    }

    default:
      return exhaustiveCheck(action);
  }
};
