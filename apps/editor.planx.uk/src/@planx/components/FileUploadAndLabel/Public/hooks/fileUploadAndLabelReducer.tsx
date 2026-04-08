import { exhaustiveCheck } from "utils";

export interface FileUploadState {
  drawingNumbers: Record<string, string>;
}

export const initialState: FileUploadState = {
  drawingNumbers: {},
};

export type FileUploadAction =
  | {
      type: "UPDATE_DRAWING_NUMBER";
      payload: { slotId: string; value: string };
    }
  | { type: "REMOVE_DRAWING_NUMBER"; payload: { slotId: string } };

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

    default:
      return exhaustiveCheck(action);
  }
};
