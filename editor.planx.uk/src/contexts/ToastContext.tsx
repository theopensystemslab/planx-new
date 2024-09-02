/* eslint-disable @typescript-eslint/no-empty-function */
import ToastContainer from "components/Toast/ToastContainer";
import {
  ToastContextType,
  ToastState,
  ToastType,
} from "components/Toast/types";
import React, { createContext, ReactNode, useReducer } from "react";
import { toastReducer } from "reducers/toastReducer";

const defaultCreateContextValue = {
  remove: (_id: number) => {},
  addToast: (_type: ToastType, _message: string) => {},
  success: (_message: string) => {},
  warning: (_message: string) => {},
  info: (_message: string) => {},
  error: (_message: string) => {},
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
  const addToast = (type: ToastType, message: string) => {
    const id = Math.floor(Math.random() * 10_000_000);
    dispatch({ type: "ADD_TOAST", payload: { id, message, type } });
  };
  const remove = (id: number) => {
    dispatch({ type: "DELETE_TOAST", payload: { id } });
  };
  const success = (message: string) => {
    addToast("success", message);
  };

  const warning = (message: string) => {
    addToast("warning", message);
  };

  const info = (message: string) => {
    addToast("info", message);
  };

  const error = (message: string) => {
    addToast("error", message);
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
