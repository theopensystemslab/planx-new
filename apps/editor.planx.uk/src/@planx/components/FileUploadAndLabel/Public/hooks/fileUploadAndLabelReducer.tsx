import { exhaustiveCheck } from "utils";

export interface FileUploadState {
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

    default:
      return exhaustiveCheck(action);
  }
};
