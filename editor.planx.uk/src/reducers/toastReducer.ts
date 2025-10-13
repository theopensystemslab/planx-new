import { ToastAction, ToastState } from "components/Toast/types";

export const toastReducer = (state: ToastState, action: ToastAction) => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [...state.toasts, action.payload],
      };
    case "REMOVE_TOAST": {
      const updatedToasts = state.toasts.filter(
        (toast) => toast.id !== action.payload.id,
      );
      return {
        ...state,
        toasts: updatedToasts,
      };
    }
    default:
      // @ts-ignore
      //   Typescript complains because action is of type 'never' here
      throw new Error(`Unhandled action type: ${action.type}`);
  }
};
