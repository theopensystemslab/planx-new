import type { FileUploadSlot } from "@planx/components/FileUpload/model";
import type { SetStateAction } from "react";
import { exhaustiveCheck } from "utils";

export interface FileUploadState {
  slots: FileUploadSlot[];
  drawingNumbers: Record<string, string>;
  /**
   * Accordion state: only one file can be expanded for editing at a time
   */
  expandedSlotId?: string;
  fileListError?: string;
  dropzoneError?: string;
  fileLabelErrors?: Record<string, string>;
}

export const initialState: FileUploadState = {
  slots: [],
  drawingNumbers: {},
};

export type FileUploadAction =
  | {
      type: "UPDATE_DRAWING_NUMBER";
      payload: { slotId: string; value: string };
    }
  | { type: "REMOVE_DRAWING_NUMBER"; payload: { slotId: string } }
  | { type: "EXPAND_SLOT"; payload: { slotId: string } }
  | { type: "SET_FILE_LIST_ERROR"; payload: { error: string } }
  | { type: "SET_DROPZONE_ERROR"; payload: { error: string } }
  | {
      type: "SET_FILE_LABEL_ERRORS";
      payload: { errors: Record<string, string> };
    }
  | { type: "SET_SLOTS"; payload: SetStateAction<FileUploadSlot[]> };

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

    default:
      return exhaustiveCheck(action);
  }
};
