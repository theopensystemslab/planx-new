/* eslint-disable @typescript-eslint/no-empty-function */
import ToastContainer from "components/Toast/ToastContainer";
import type {
  ToastContextType,
  ToastState,
  ToastType,
} from "components/Toast/types";
import type { ReactNode } from "react";
import { createContext, useReducer } from "react";
import { toastReducer } from "reducers/toastReducer";
import { v4 as uuidv4 } from "uuid";

const defaultCreateContextValue = {
  remove: (_id: string) => {},
  addToast: (_type: ToastType, _message: string, _hideDuration?: number) => {},
  success: (_message: string, _hideDuration?: number) => {},
  warning: (_message: string, _hideDuration?: number) => {},
  info: (_message: string, _hideDuration?: number) => {},
  error: (_message: string, _hideDuration?: number) => {},
};

export const ToastContext = createContext<ToastContextType>(
  defaultCreateContextValue,
);

const initialState: ToastState = {
  toasts: [],
};

export const ToastContextProvider = ({
  children,
}: Readonly<{ children: ReactNode }>) => {
  const [state, dispatch] = useReducer(toastReducer, initialState);
  const addToast = (
    type: ToastType,
    message: string,
    hideDuration?: number,
  ) => {
    const id = uuidv4();
    dispatch({
      type: "ADD_TOAST",
      payload: { id, message, type, hideDuration },
    });
  };
  const remove = (id: string) => {
    dispatch({ type: "REMOVE_TOAST", payload: { id } });
  };
  const success = (message: string, hideDuration?: number) => {
    addToast("success", message, hideDuration);
  };

  const warning = (message: string, hideDuration?: number) => {
    addToast("warning", message, hideDuration);
  };

  const info = (message: string, hideDuration?: number) => {
    addToast("info", message, hideDuration);
  };

  const error = (message: string, hideDuration?: number) => {
    addToast("error", message, hideDuration);
  };

  const value: ToastContextType = {
    success,
    warning,
    info,
    error,
    remove,
    addToast,
  };

  return (
    <ToastContext.Provider value={value}>
      <ToastContainer toasts={state.toasts} />
      {children}
    </ToastContext.Provider>
  );
};
