import { exhaustiveCheck } from "utils";

import type { FileList, FileUploadAndLabelSlot } from "../../model";

export interface FileUploadState {
  slots: FileUploadAndLabelSlot[];
  // TODO: Readonly<T> ?
  fileList: FileList;
  fileUploadStatus?: string;
  expandedSlotId?: string;
  errors?: {
    dropzone?: string;
    fileList?: string;
    fileLabel?: Record<string, string>;
  };

  // File removal- Two-step process required to allow UI to animate out before data is deleted
  pendingRemoval: FileUploadAndLabelSlot | null;
  removingSlotId: string | null;
}

export const initialState: FileUploadState = {
  slots: [],
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
  | { type: "UPDATE_TAGS"; payload: { slotId: string; tags: string[] } }
  | {
      type: "UPDATE_DRAWING_NUMBER";
      payload: { slotId: string; value: string };
    }

  // Dropzone sync
  | { type: "SET_SLOTS"; payload: FileUploadAndLabelSlot[] }
  | { type: "SET_FILE_UPLOAD_STATUS"; payload: string }

  // File removal process
  | { type: "INIT_REMOVE_FILE"; payload: { slot: FileUploadAndLabelSlot } }
  | { type: "COMPLETE_REMOVE_FILE" }

  // UI controls
  | { type: "EXPAND_SLOT"; payload: { slotId: string } }
  | { type: "SAVE_SLOT"; payload: { slotId: string } }
  | {
      type: "SET_ERRORS";
      payload: NonNullable<FileUploadState["errors"]>;
    };

export const fileUploadAndLabelReducer = (
  state: FileUploadState,
  action: FileUploadAction,
): FileUploadState => {
  switch (action.type) {
    case "UPDATE_TAGS": {
      const { [action.payload.slotId]: _, ...remainingFileLabels } =
        state.errors?.fileLabel || {};

      return {
        ...state,
        slots: state.slots.map((slot) =>
          slot.id === action.payload.slotId
            ? { ...slot, tags: action.payload.tags }
            : slot,
        ),
        // Clear global validation errors when the user interacts
        errors: {
          ...state.errors,
          fileList: undefined,
          fileLabel: remainingFileLabels,
        },
      };
    }

    case "UPDATE_DRAWING_NUMBER": {
      return {
        ...state,
        slots: state.slots.map((slot) =>
          slot.id === action.payload.slotId
            ? { ...slot, drawingNumber: action.payload.value }
            : slot,
        ),
      };
    }

    case "SET_SLOTS": {
      const newSlots = action.payload.filter(
        (newSlot) => !state.slots.some((oldSlot) => oldSlot.id === newSlot.id),
      );
      const isNewFileUpload = newSlots.length > 0;

      return {
        ...state,
        slots: action.payload,
        // Auto-expand if a new file was just added
        expandedSlotId: isNewFileUpload ? newSlots[0].id : state.expandedSlotId,
        // Clear error on new upload
        errors: isNewFileUpload
          ? { ...state.errors, dropzone: undefined }
          : state.errors,
      };
    }

    case "SET_FILE_UPLOAD_STATUS": {
      return {
        ...state,
        fileUploadStatus: action.payload,
      };
    }

    case "INIT_REMOVE_FILE": {
      return {
        ...state,
        pendingRemoval: action.payload.slot,
        removingSlotId: action.payload.slot.id,
        expandedSlotId: undefined,
      };
    }

    case "COMPLETE_REMOVE_FILE": {
      const nextSlots = state.slots.filter(
        (slot) => slot.id !== state.removingSlotId,
      );
      const isLastFile = nextSlots.length === 0;

      return {
        ...state,
        slots: nextSlots,
        pendingRemoval: null,
        removingSlotId: null,
        // Clear errors if they deleted the last file
        errors: isLastFile
          ? {
              ...state.errors,
              fileList: undefined,
              fileLabel: undefined,
            }
          : state.errors,
      };
    }

    case "EXPAND_SLOT": {
      const { [action.payload.slotId]: _, ...remainingFileLabels } =
        state.errors?.fileLabel || {};

      return {
        ...state,
        expandedSlotId: action.payload.slotId,
        errors: {
          ...state.errors,
          fileList: undefined,
          fileLabel: remainingFileLabels,
        },
      };
    }

    case "SAVE_SLOT": {
      const currentSlotIndex = state.slots.findIndex(
        (s) => s.id === action.payload.slotId,
      );

      // Find the next file that has no tags yet
      const nextUntaggedSlot = state.slots
        .slice(currentSlotIndex + 1)
        .find((s) => s.tags.length === 0);

      return {
        ...state,
        expandedSlotId: nextUntaggedSlot?.id,
        errors: {
          ...state.errors,
          fileList: undefined,
        },
      };
    }

    case "SET_ERRORS": {
      return {
        ...state,
        errors: {
          ...state.errors,
          ...action.payload,
        },
      };
    }

    default:
      return exhaustiveCheck(action);
  }
};
